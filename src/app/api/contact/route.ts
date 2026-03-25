/** @format */

import { NextRequest, NextResponse } from "next/server";
import { FormData } from "../../../types";
import {
	SpentriaRequestBody,
	SpentriaResponse,
} from "../../../types/form/spentria";

const SPENTRIA_TIMEOUT_MS = 10_000;

function getVisitorIP(request: NextRequest): string | undefined {
	const xff = request.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0].trim();
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp;
	return undefined;
}

interface SpentriaPowChallenge {
	challenge_id: string;
	nonce: string;
	difficulty: number;
	algorithm: string;
	expires_at: string;
}

interface SpentriaAnalysisResult {
	response: SpentriaResponse | null;
	powChallenge?: SpentriaPowChallenge;
}

function buildSpentriaBody(
	formData: FormData,
	visitorIP: string | undefined,
	proof?: { challenge_id: string; solution: string }
): SpentriaRequestBody & { proof?: { challenge_id: string; solution: string } } {
	const body: SpentriaRequestBody & { proof?: { challenge_id: string; solution: string } } = {
		message: formData.message,
		context:
			"Professional portfolio contact form for a French web developer specialized in accessibility",
		email: formData.email,
		sender_ip: visitorIP,
		allowed_languages: ["fr", "en"],
		commercial_policy: "moderate",
		subject: formData.subject,
		firstname: formData.firstName,
		lastname: formData.lastName,
		phone: formData.phone,
		custom_fields: formData.company ? { company: formData.company } : undefined,
	};

	if (proof) {
		body.proof = proof;
	}

	return body;
}

async function fetchChallenge(difficulty: number): Promise<SpentriaPowChallenge | null> {
	const apiKey = process.env.SPENTRIA_API_KEY;
	const baseUrl = process.env.SPENTRIA_API_URL;

	if (!apiKey || !baseUrl) return null;

	const challengeUrl = baseUrl.replace("/analyze/contact", "/challenge/generate");

	try {
		const response = await fetch(challengeUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ type: "contact", difficulty }),
		});

		if (!response.ok) {
			console.error("Spentria challenge error:", response.status);
			return null;
		}

		return (await response.json()) as SpentriaPowChallenge;
	} catch (error) {
		console.error("Failed to fetch Spentria challenge:", error);
		return null;
	}
}

async function analyzeWithSpentria(
	formData: FormData,
	visitorIP: string | undefined,
	proof?: { challenge_id: string; solution: string }
): Promise<SpentriaAnalysisResult> {
	const apiKey = process.env.SPENTRIA_API_KEY;
	const apiUrl = process.env.SPENTRIA_API_URL;

	if (!apiKey || !apiUrl) {
		console.error("Missing Spentria configuration (SPENTRIA_API_KEY or SPENTRIA_API_URL)");
		return { response: null };
	}

	const body = buildSpentriaBody(formData, visitorIP, proof);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), SPENTRIA_TIMEOUT_MS);

	try {
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
			signal: controller.signal,
		});

		if (response.status === 429) {
			const errorData = await response.json();
			if (errorData.code === "POW_REQUIRED") {
				console.log("Spentria: PoW required, difficulty:", errorData.difficulty);
				const challenge = await fetchChallenge(errorData.difficulty || 16);
				if (challenge) {
					console.log("Spentria: challenge obtained, id:", challenge.challenge_id);
					return { response: null, powChallenge: challenge };
				}
				console.warn("Spentria: failed to obtain challenge, falling back to fail-open");
			}
			return { response: null };
		}

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("Spentria API error:", {
				status: response.status,
				body: errorBody,
			});
			return { response: null };
		}

		return { response: (await response.json()) as SpentriaResponse };
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			console.error("Spentria API timeout after", SPENTRIA_TIMEOUT_MS, "ms");
		} else {
			console.error("Spentria API network error:", error);
		}
		return { response: null };
	} finally {
		clearTimeout(timeout);
	}
}

function forwardSpamLog(
	formData: FormData,
	spentriaResult: SpentriaResponse,
	visitorIP: string | undefined
): void {
	const endpoint = process.env.SPAM_LOG_ENDPOINT;
	const token = process.env.SPAM_LOG_TOKEN;

	if (!endpoint || !token) {
		console.warn("Missing SPAM_LOG_ENDPOINT or SPAM_LOG_TOKEN, skipping spam log");
		return;
	}

	const cleanIP =
		visitorIP?.startsWith("::ffff:") ? visitorIP.replace("::ffff:", "") : visitorIP;

	const payload = {
		source: "portfolio",
		type: "spam",
		timestamp: new Date().toISOString(),
		spentria_request_id: spentriaResult.request_id,
		spentria_reason: spentriaResult.reason,
		visitor_email: formData.email,
		visitor_ip: cleanIP || null,
		message_subject: formData.subject,
		message_body: formData.message,
	};

	fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then(async (res) => {
			const body = await res.text();
			if (!res.ok) {
				console.error("Spam log endpoint returned", res.status, body);
			} else {
				console.log("Spam log forwarded successfully:", body);
			}
		})
		.catch((error) => {
			console.error("Failed to forward spam log:", error);
		});
}

async function sendEmail(
	formData: FormData,
	subjectPrefix?: string,
	spentriaReason?: string | null,
	tagsSuffix?: string
): Promise<Response> {
	const emailjsConfig = {
		service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
		template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
		user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
	};

	if (
		!emailjsConfig.service_id ||
		!emailjsConfig.template_id ||
		!emailjsConfig.user_id
	) {
		throw new Error("Missing EmailJS configuration");
	}

	const baseEmailSubject = subjectPrefix
		? `${subjectPrefix} ${formData.subject}`
		: formData.subject;
	const emailSubject = tagsSuffix ? `${baseEmailSubject}${tagsSuffix}` : baseEmailSubject;

	const emailParams: Record<string, string> = {
		firstName: formData.firstName,
		lastName: formData.lastName,
		reply_to: formData.email,
		phone: formData.phone || "",
		company: formData.company || "",
		email_subject: emailSubject,
		subject: formData.subject,
		message: formData.message,
		spentria_info: spentriaReason
			? `⚠️ [Spentria] Raison : ${spentriaReason}`
			: "",
		system_date: formData.date || "",
		system_time: formData.heure || "",
		system_language: formData.lang || "fr",
	};

	return fetch("https://api.emailjs.com/api/v1.0/email/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: "https://simon-lm.dev",
		},
		body: JSON.stringify({
			service_id: emailjsConfig.service_id,
			template_id: emailjsConfig.template_id,
			user_id: emailjsConfig.user_id,
			template_params: emailParams,
		}),
	});
}

export async function POST(request: NextRequest) {
	try {
		// 1. Parse request body
		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 }
			);
		}

		const formData = body as FormData;

		// 2. Honeypot check
		if (formData.honeypot) {
			return NextResponse.json({ success: true, message: "Email sent successfully" });
		}

		// 3. Analyze with Spentria (with optional PoW proof from client retry)
		const visitorIP = getVisitorIP(request);
		const proof = formData.proof as { challenge_id: string; solution: string } | undefined;
		if (proof) {
			console.log("Spentria: retrying with PoW proof, challenge_id:", proof.challenge_id);
		}
		const analysis = await analyzeWithSpentria(formData, visitorIP, proof);

		// 3b. Handle PoW challenge — return challenge to client for computation
		if (analysis.powChallenge) {
			return NextResponse.json({
				powRequired: true,
				challenge: analysis.powChallenge,
			});
		}

		const spentriaResult = analysis.response;

		// 4. Handle Spentria result
		// Fail-open: if Spentria is unavailable or chain_exhausted, send email normally
		const isFailOpen =
			!spentriaResult || spentriaResult.reason === "chain_exhausted";

		if (!isFailOpen && spentriaResult.result === "spam") {
			// Spam: log and return fake success
			console.warn("Spentria: spam detected", {
				request_id: spentriaResult.request_id,
				reason: spentriaResult.reason,
				email: formData.email,
				ip: visitorIP,
			});
			forwardSpamLog(formData, spentriaResult, visitorIP);
			return NextResponse.json({ success: true, message: "Email sent successfully" });
		}

		// 5. Determine email handling
		let subjectPrefix = "PORTFOLIO ||";
		let spentriaReason: string | null | undefined;
		let tagsSuffix = "";

		if (isFailOpen) {
			subjectPrefix = "[To check] PORTFOLIO ||";
		} else if (spentriaResult.result === "borderline") {
			subjectPrefix = "[Borderline_PortfolioSimonLM]";
			spentriaReason = spentriaResult.reason;
		}

		// Append Spentria tags to subject
		if (spentriaResult?.tags?.matched?.length) {
			tagsSuffix = " " + spentriaResult.tags.matched
				.map((tag: { name: string }) => `#${tag.name}`)
				.join(" ");
		}

		// 6. Send email (fit, borderline, or fail-open)
		const emailResponse = await sendEmail(formData, subjectPrefix, spentriaReason, tagsSuffix);

		if (!emailResponse.ok) {
			const responseText = await emailResponse.text();
			throw new Error(`EmailJS Error: ${responseText}`);
		}

		return NextResponse.json({
			success: true,
			message: "Email sent successfully",
		});
	} catch (error: unknown) {
		console.error("Server error:", error);
		return NextResponse.json(
			{
				error: "Server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
