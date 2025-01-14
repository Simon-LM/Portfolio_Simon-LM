/** @format */

import { NextRequest, NextResponse } from "next/server";
// Supprimer ces importations conflictuelles
// import emailjs from "@emailjs/browser";
// import { SMTPClient } from "emailjs";

// Utiliser uniquement @emailjs/browser

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const MINIMUM_SCORE = 0;

async function verifyRecaptcha(token: string) {
	try {
		// Log avant la vérification
		console.log(
			"Attempting reCAPTCHA verification with token:",
			token.substring(0, 20) + "..."
		);

		const response = await fetch(
			"https://www.google.com/recaptcha/api/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
			}
		);

		if (!response.ok) {
			throw new Error(`reCAPTCHA verification failed: ${response.statusText}`);
		}

		const data = await response.json();
		// Log détaillé de la réponse
		console.log("reCAPTCHA API Response:", {
			success: data.success,
			score: data.score,
			action: data.action,
			challengeTs: data.challenge_ts,
			hostname: data.hostname,
			errorCodes: data["error-codes"], // Important pour le debug
		});

		return {
			success: data.success && data.score >= MINIMUM_SCORE,
			score: data.score,
			details: data, // Ajout des détails complets
		};
	} catch (error) {
		console.error("reCAPTCHA Verification Error:", {
			error,
			secretKeyPresent: !!RECAPTCHA_SECRET_KEY,
			secretKeyLength: RECAPTCHA_SECRET_KEY?.length,
		});
		return { success: false, score: 0, details: null };
	}
}

// Supprimer l'interface inutilisée et la remplacer par un type plus simple
type ApiErrorResponse = {
	message: string;
	status?: number;
	details?: string;
};

// Ajouter cette interface en haut du fichier avec les autres interfaces
interface FormDataType {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	company?: string;
	subject: string;
	message: string;
}

export async function POST(request: NextRequest) {
	let requestFormData: FormDataType = {
		firstName: "",
		lastName: "",
		email: "",
		subject: "",
		message: "",
	}; // Type plus précis

	try {
		// Log toutes les variables au début pour debug
		console.log("=== DEBUG START ===");
		console.log({
			hasRecaptchaSecret: !!process.env.RECAPTCHA_SECRET_KEY,
			hasServiceId: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			hasTemplateId: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			hasPublicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			isDevelopment: process.env.NODE_ENV === "development",
		});

		// Vérification initiale des variables d'environnement
		console.log("=== ENV VARS CHECK ===");
		console.log(
			"RECAPTCHA_SECRET_KEY exists:",
			!!process.env.RECAPTCHA_SECRET_KEY
		);
		console.log(
			"SERVICE_ID exists:",
			!!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
		);
		console.log(
			"TEMPLATE_ID exists:",
			!!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
		);
		console.log(
			"PUBLIC_KEY exists:",
			!!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
		);
		console.log("==================");

		// Vérifier toutes les variables d'environnement au démarrage
		const requiredEnvVars = {
			RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
			SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
		};

		// Log pour debug
		console.log("Environment variables status:", {
			...Object.entries(requiredEnvVars).reduce(
				(acc, [key, value]) => ({
					...acc,
					[key]: !!value,
				}),
				{}
			),
		});

		// Vérifier si une variable manque (correction du paramètre inutilisé)
		const missingVars = Object.entries(requiredEnvVars)
			.filter(([, value]) => !value) // Enlever le '_' inutilisé
			.map(([key]) => key);

		if (missingVars.length > 0) {
			console.error("Missing environment variables:", missingVars);
			return NextResponse.json(
				{ error: "Server configuration error", details: missingVars },
				{ status: 500 }
			);
		}

		const body = await request.json();

		if (!body) {
			console.error("Empty request body");
			return NextResponse.json({ error: "Invalid request" }, { status: 400 });
		}

		console.log("Request body:", body);

		const { "g-recaptcha-response": recaptchaToken, ...formData } = body;
		requestFormData = formData as FormDataType; // Cast typé

		if (!recaptchaToken) {
			console.error("Missing reCAPTCHA token");
			return NextResponse.json(
				{ error: "Missing security token" },
				{ status: 400 }
			);
		}

		// Vérifier le reCAPTCHA
		const recaptchaResult = await verifyRecaptcha(recaptchaToken);
		console.log("reCAPTCHA verification result:", recaptchaResult);
		if (!recaptchaResult.success) {
			return NextResponse.json(
				{ error: "reCAPTCHA verification failed" },
				{ status: 400 }
			);
		}

		// Simplifier l'envoi d'email
		const emailData = {
			service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			template_params: requestFormData,
		};

		// Avant l'envoi de l'email
		console.log("Email config:", {
			service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			template_params_exists: !!requestFormData,
		});

		console.log("Attempting to send email with config:", {
			...emailData,
			template_params: "REDACTED",
		});

		// Modification de l'appel EmailJS
		const emailResponse = await fetch(
			"https://api.emailjs.com/api/v1.0/email/send",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
					template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
					user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
					template_params: {
						...requestFormData,
						"g-recaptcha-response": recaptchaToken,
					},
				}),
			}
		);

		// Log de la réponse EmailJS
		const responseText = await emailResponse.text();
		console.log("EmailJS Response:", {
			status: emailResponse.status,
			ok: emailResponse.ok,
			text: responseText,
		});

		if (!emailResponse.ok) {
			throw new Error(`EmailJS Error: ${responseText}`);
		}

		return NextResponse.json({
			message: "Email sent successfully",
			recaptchaScore: recaptchaResult.score,
		});
	} catch (error: unknown) {
		console.error("=== ERROR DETAILS ===");
		console.error(error);
		console.error("DETAILED ERROR:", {
			error: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : "No stack trace",
			env: process.env.NODE_ENV,
		});
		// ...existing error handling...
		const errorResponse: ApiErrorResponse = {
			message: error instanceof Error ? error.message : "Unknown error",
			status: 500,
			details:
				process.env.NODE_ENV === "development"
					? error instanceof Error
						? error.stack
						: "No stack trace"
					: undefined,
		};

		console.error("Full server error:", errorResponse);

		return NextResponse.json(
			{
				error: "Server error",
				details: errorResponse.message,
			},
			{ status: errorResponse.status }
		);
	}
}
