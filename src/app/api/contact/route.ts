/** @format */

import { NextRequest, NextResponse } from "next/server";
import { FormData } from "../../../types";

const MINIMUM_SCORE = 0.5;

// interface FormDataType {
// 	firstName: string;
// 	lastName: string;
// 	email: string;
// 	phone?: string;
// 	company?: string;
// 	subject: string;
// 	message: string;
// 	lang?: string;
// 	date?: string;
// 	heure?: string;
// }

export async function POST(request: NextRequest) {
	try {
		// 1. Parse request body
		let body;
		try {
			body = await request.json();
			console.log("Request body parsed successfully:", body);
		} catch (error) {
			console.error("Failed to parse request body:", error);
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 }
			);
		}

		// 2. Extract reCAPTCHA token and form data
		const { "g-recaptcha-response": token, ...formData } = body;
		const typedFormData = formData as FormData;

		// 3. Check environment variables
		console.log("Environment Check:", {
			EMAILJS_SERVICE_ID: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			EMAILJS_TEMPLATE_ID: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			EMAILJS_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			RECAPTCHA_SECRET_KEY: !!process.env.RECAPTCHA_SECRET_KEY,
		});

		// 4. Check reCAPTCHA token presence
		if (!token) {
			console.error("No reCAPTCHA token provided");
			return NextResponse.json(
				{ error: "No reCAPTCHA token provided" },
				{ status: 400 }
			);
		}
		// 5. Verify reCAPTCHA with score
		const recaptchaResponse = await fetch(
			`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
			{ method: "POST" }
		);

		const recaptchaResult = await recaptchaResponse.json();
		console.log("reCAPTCHA Result:", {
			success: recaptchaResult.success,
			score: recaptchaResult.score,
			action: recaptchaResult.action,
		});

		// 6. Check reCAPTCHA score
		if (!recaptchaResult.success || recaptchaResult.score < MINIMUM_SCORE) {
			console.error("reCAPTCHA verification failed:", {
				success: recaptchaResult.success,
				score: recaptchaResult.score,
			});
			return NextResponse.json(
				{
					error: "reCAPTCHA verification failed",
					details: `Score: ${recaptchaResult.score}, Required: ${MINIMUM_SCORE}`,
				},
				{ status: 400 }
			);
		}

		// 7. EmailJS Configuration
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

		// 8. Prepare EmailJS parameters
		const emailParams: { [key: string]: string } = {
			firstName: typedFormData.firstName,
			lastName: typedFormData.lastName,
			reply_to: typedFormData.email,
			phone: typedFormData.phone || "",
			company: typedFormData.company || "",
			subject: typedFormData.subject,
			message: typedFormData.message,
			system_date: typedFormData.date || "",
			system_time: typedFormData.heure || "",
			system_language: typedFormData.lang || "fr",
		};

		// 9. Send email via EmailJS
		const emailResponse = await fetch(
			"https://api.emailjs.com/api/v1.0/email/send",
			{
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
			}
		);

		// 10. Handle EmailJS response
		const responseText = await emailResponse.text();
		console.log("EmailJS Response:", {
			status: emailResponse.status,
			ok: emailResponse.ok,
			text: responseText,
			headers: Object.fromEntries(emailResponse.headers),
		});

		if (!emailResponse.ok) {
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
