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

// Définir une interface pour les erreurs
interface ApiError extends Error {
	message: string;
	code?: string;
	status?: number;
}

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
		if (!RECAPTCHA_SECRET_KEY) {
			console.error("Missing RECAPTCHA_SECRET_KEY");
			return NextResponse.json(
				{ error: "Server configuration error" },
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

		// Envoyer l'email directement avec @emailjs/browser
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
					template_params: requestFormData,
				}),
			}
		);

		if (!emailResponse.ok) {
			throw new Error("Failed to send email");
		}

		return NextResponse.json({
			message: "Email sent successfully",
			recaptchaScore: recaptchaResult.score,
		});
	} catch (error: unknown) {
		// Type guard pour l'erreur
		const apiError = error as ApiError;
		console.error("Detailed API Error:", {
			message: apiError.message,
			name: apiError.name,
			stack: apiError.stack,
			formData: requestFormData, // Maintenant correctement typé
			emailConfig: {
				serviceID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
				hasTemplate: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
				hasPublicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			},
		});

		return NextResponse.json(
			{
				error: "Server error",
				details:
					process.env.NODE_ENV === "development"
						? apiError.message
						: "Email sending failed",
			},
			{ status: 500 }
		);
	}
}
