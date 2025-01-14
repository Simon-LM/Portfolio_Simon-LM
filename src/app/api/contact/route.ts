/** @format */

import { NextRequest, NextResponse } from "next/server";
// Supprimer ces importations conflictuelles
// import emailjs from "@emailjs/browser";
// import { SMTPClient } from "emailjs";

// Utiliser uniquement @emailjs/browser

// Supprimer ces constantes qui ne sont plus utilisées
// const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
// const MINIMUM_SCORE = 0;

// Supprimer la fonction verifyRecaptcha qui n'est plus utilisée
// async function verifyRecaptcha(token: string) { ... }

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
	try {
		// Vérifier si le corps de la requête est valide
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

		// Extraire et typer les données du formulaire
		const { "g-recaptcha-response": token, ...formData } = body;
		const typedFormData = formData as FormDataType; // Ajouter le typage ici

		// Vérifier les variables d'environnement cruciales
		console.log("Environment Check:", {
			EMAILJS_SERVICE_ID: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
			EMAILJS_TEMPLATE_ID: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
			EMAILJS_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
			RECAPTCHA_SECRET_KEY: !!process.env.RECAPTCHA_SECRET_KEY,
		});

		// Extraire le token reCAPTCHA
		if (!token) {
			console.error("No reCAPTCHA token provided");
			return NextResponse.json(
				{ error: "No reCAPTCHA token provided" },
				{ status: 400 }
			);
		}

		// La vérification reCAPTCHA se fait maintenant directement dans la fonction POST
		const recaptchaResponse = await fetch(
			`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
			{ method: "POST" }
		);

		const recaptchaResult = await recaptchaResponse.json();
		console.log("reCAPTCHA verification result:", recaptchaResult);

		// Envoyer l'email seulement si reCAPTCHA est valide
		if (recaptchaResult.success) {
			try {
				// Vérifier toutes les variables EmailJS
				const emailjsConfig = {
					service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
					template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
					user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
				};

				// Log de débogage
				console.log("EmailJS Configuration Check:", {
					hasServiceId: !!emailjsConfig.service_id,
					hasTemplateId: !!emailjsConfig.template_id,
					hasUserId: !!emailjsConfig.user_id,
					formDataKeys: Object.keys(typedFormData),
				});

				// Vérifier que toutes les configs sont présentes
				if (
					!emailjsConfig.service_id ||
					!emailjsConfig.template_id ||
					!emailjsConfig.user_id
				) {
					throw new Error("Missing EmailJS configuration");
				}

				// Mapper les données du formulaire aux variables EmailJS avec les noms correspondants au template
				const emailParams: { [key: string]: string } = {
					firstName: typedFormData.firstName,
					lastName: typedFormData.lastName,
					email: typedFormData.email,
					phone: typedFormData.phone || "",
					company: typedFormData.company || "",
					subject: typedFormData.subject,
					message: typedFormData.message,
					reply_to: typedFormData.email, // Ajout de la variable reply_to
				};

				// Optionnel : Ajouter des variables système si nécessaire
				// emailParams.system_date = new Date().toLocaleDateString();
				// emailParams.system_time = new Date().toLocaleTimeString();
				// emailParams.system_language = language;

				// Log des paramètres envoyés pour le débogage
				console.log("EmailJS Template Parameters:", emailParams);

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
							template_params: emailParams, // Utiliser les paramètres mappés
						}),
					}
				);

				// Log de la réponse pour debug
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
				console.error("EmailJS Detailed Error:", error);
				const emailError = error as Error; // Type assertion ici
				return NextResponse.json(
					{
						error: "Failed to send email",
						details: emailError.message,
					},
					{ status: 500 }
				);
			}
		}

		return NextResponse.json(
			{ error: "reCAPTCHA verification failed" },
			{ status: 400 }
		);
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
