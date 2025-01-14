/** @format */

import { NextRequest, NextResponse } from "next/server";
import emailjs from "@emailjs/browser";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const MINIMUM_SCORE = 0.5;

async function verifyRecaptcha(token: string) {
	try {
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

		const data = await response.json();
		return {
			success: data.success && data.score >= MINIMUM_SCORE,
			score: data.score,
		};
	} catch (error) {
		console.error("reCAPTCHA verification failed:", error);
		return { success: false, score: 0 };
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { "g-recaptcha-response": recaptchaToken, ...formData } = body;

		// Vérifier le reCAPTCHA
		const recaptchaResult = await verifyRecaptcha(recaptchaToken);
		if (!recaptchaResult.success) {
			return NextResponse.json(
				{ error: "reCAPTCHA verification failed" },
				{ status: 400 }
			);
		}

		// Envoyer l'email avec EmailJS
		await emailjs.send(
			process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
			process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
			formData,
			process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
		);

		return NextResponse.json({ message: "Email sent successfully" });
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
