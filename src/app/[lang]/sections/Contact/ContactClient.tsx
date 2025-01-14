/** @format */

"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Form from "@radix-ui/react-form";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import Script from "next/script";

declare global {
	interface Window {
		grecaptcha: {
			ready: (callback: () => void) => void;
			execute: (
				siteKey: string,
				options: { action: string }
			) => Promise<string>;
			render: (container: string, options: ReCaptchaRenderOptions) => number;
		};
	}
}

interface ReCaptchaRenderOptions {
	sitekey: string;
	size?: "invisible";
	badge?: "bottomright" | "bottomleft" | "inline";
	theme?: "light" | "dark";
}

interface ContactProps {
	dictionary: ContactDictionary;
}

interface ContactDictionary {
	title: string;
	subtitle: string;
	form: FormDictionary;
	social: {
		linkedin: string;
		twitter: string;
	};
}

interface FormDictionary {
	firstName: string;
	lastName: string;
	optional: string;
	phone: string;
	company: string;
	email: string;
	emailFormat: string;
	phoneFormat: {
		line1: string;
		line2: string;
	};
	subject: string;
	message: string;
	submit: string;
	sending: string;
	success: string;
	error: string;
	recaptcha: {
		error: {
			title: string;
			cause: string;
			reasons: string[];
			solutions: {
				title: string;
				items: string[];
			};
		};
	};
	errors: {
		firstName: string;
		lastName: string;
		email: string;
		subject: string;
		message: string;
		gdpr: string;
	};
	gdpr: {
		text: string;
		privacyLink: string;
		checkbox: string;
	};
}

// Supprimer ces lignes
// const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
// const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

// Garder uniquement
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export default function ContactClient({ dictionary }: ContactProps) {
	const [isLoading, setIsLoading] = useState(false);

	// Initialize EmailJS
	useEffect(() => {
		if (PUBLIC_KEY) {
			emailjs.init(PUBLIC_KEY);
		}
	}, []);

	// Load reCAPTCHA v3
	useEffect(() => {
		const loadReCaptcha = () => {
			window.grecaptcha?.ready(() => {
				console.log("reCAPTCHA v3 is ready");
			});
		};

		if (typeof window !== "undefined" && window.grecaptcha) {
			loadReCaptcha();
		}
	}, []);

	const createValidationSchema = () => {
		return z.object({
			firstName: z.string().min(2, dictionary.form.errors.firstName),
			lastName: z.string().min(2, dictionary.form.errors.lastName),
			phone: z
				.string()
				.optional()
				.refine((val) => !val || phoneRegex.test(val), {
					message: dictionary.form.phoneFormat.line1,
				}),
			company: z.string().optional(),
			email: z.string().email(dictionary.form.errors.email),
			subject: z.string().min(2, dictionary.form.errors.subject),
			message: z.string().min(10, dictionary.form.errors.message),
			honeypot: z.string().max(0, "Champ non valide"),
			gdprConsent: z.boolean().refine((val) => val === true, {
				message: dictionary.form.errors.gdpr,
			}),
		});
	};

	const schema = createValidationSchema();
	type FormData = z.infer<typeof schema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	// Optimiser la gestion de reCAPTCHA
	const executeRecaptcha = async () => {
		try {
			return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY || "", {
				action: "submit_contact",
			});
		} catch (error) {
			console.error("reCAPTCHA execution failed:", error);
			throw error;
		}
	};

	// Optimiser l'envoi du formulaire
	const onSubmit = async (formData: FormData) => {
		setIsLoading(true);
		try {
			// Exécuter reCAPTCHA v3
			const token = await executeRecaptcha();

			// Appeler l'API route avec le token reCAPTCHA
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					"g-recaptcha-response": token,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(dictionary.form.success);
				reset();
			} else {
				throw new Error(data.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(
				<div className="recaptcha-error" role="alert">
					<h3>{dictionary.form.recaptcha.error.title}</h3>
					<p>{dictionary.form.recaptcha.error.cause}</p>
					<ul>
						{dictionary.form.recaptcha.error.reasons.map((reason, index) => (
							<li key={index}>{reason}</li>
						))}
					</ul>
					<p>{dictionary.form.recaptcha.error.solutions.title}</p>
					<ul>
						{dictionary.form.recaptcha.error.solutions.items.map(
							(solution, index) => (
								<li key={index}>
									{index === 2 ? (
										<a
											href={dictionary.social.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											className="recaptcha-error__link">
											{solution}
										</a>
									) : (
										solution
									)}
								</li>
							)
						)}
					</ul>
				</div>,
				{ duration: 10000 }
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Script reCAPTCHA v3 */}
			<Script
				src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}&badge=bottomleft`}
				strategy="afterInteractive"
			/>

			<section id="contact" className="contact">
				<div className="contact__container">
					<h2 className="contact__title">{dictionary.title}</h2>

					<Form.Root
						className="contact__form"
						onSubmit={handleSubmit(onSubmit)}>
						{/* Honeypot field  */}
						<div className="sr-only" aria-hidden="true">
							<Form.Field className="contact__form-field" name="honeypot">
								<Form.Label className="contact__form-label">
									Ne pas remplir
								</Form.Label>
								<Form.Control asChild>
									<input
										tabIndex={-1}
										{...register("honeypot")}
										autoComplete="off"
									/>
								</Form.Control>
							</Form.Field>
						</div>

						{/* Form fields */}
						<div className="contact__form-fields">
							{/* First Name */}
							<Form.Field className="contact__form-field" name="firstName">
								<Form.Label className="contact__form-label">
									{dictionary.form.firstName}
								</Form.Label>
								<Form.Control asChild>
									<input
										className="contact__form-input"
										{...register("firstName")}
										aria-invalid={errors.firstName ? "true" : "false"}
										data-required="true"
									/>
								</Form.Control>
								{errors.firstName && (
									<Form.Message className="contact__form-error">
										{errors.firstName.message}
									</Form.Message>
								)}
							</Form.Field>

							{/* Last Name */}
							<Form.Field className="contact__form-field" name="lastName">
								<Form.Label className="contact__form-label">
									{dictionary.form.lastName}
								</Form.Label>
								<Form.Control asChild>
									<input
										className="contact__form-input"
										{...register("lastName")}
										aria-invalid={errors.lastName ? "true" : "false"}
										data-required="true"
									/>
								</Form.Control>
								{errors.lastName && (
									<Form.Message className="contact__form-error">
										{errors.lastName.message}
									</Form.Message>
								)}
							</Form.Field>

							{/* Company */}
							<Form.Field className="contact__form-field" name="company">
								<Form.Label className="contact__form-label">
									{dictionary.form.company}
									<span className="optional">{dictionary.form.optional}</span>
								</Form.Label>
								<Form.Control asChild>
									<input
										className="contact__form-input"
										{...register("company")}
									/>
								</Form.Control>
							</Form.Field>

							{/* Phone */}
							<Form.Field className="contact__form-field" name="phone">
								<Form.Label className="contact__form-label">
									{dictionary.form.phone}
									<span className="optional">{dictionary.form.optional}</span>
								</Form.Label>
								<Form.Control asChild>
									<input
										type="tel"
										className="contact__form-input"
										{...register("phone")}
										aria-invalid={errors.phone ? "true" : "false"}
										pattern="^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$"
										aria-describedby="phone-format"
									/>
								</Form.Control>
								<div id="phone-format" className="contact__form-hint-phones">
									<div className="contact__form-hint">
										{dictionary.form.phoneFormat.line1}
									</div>
									<div className="contact__form-hint">
										{dictionary.form.phoneFormat.line2}
									</div>
								</div>
								{errors.phone && (
									<Form.Message className="contact__form-error">
										{errors.phone.message}
									</Form.Message>
								)}
							</Form.Field>

							{/* Email */}
							<Form.Field
								className="contact__form-field contact__form-field-email"
								name="email">
								<Form.Label className="contact__form-label">
									{dictionary.form.email}
								</Form.Label>
								<Form.Control asChild>
									<input
										type="email"
										className="contact__form-input"
										{...register("email")}
										aria-invalid={errors.email ? "true" : "false"}
										aria-describedby="email-format"
										data-required="true"
									/>
								</Form.Control>
								<div id="email-format" className="contact__form-hint">
									{dictionary.form.emailFormat}
								</div>
								{errors.email && (
									<Form.Message className="contact__form-error">
										{errors.email.message}
									</Form.Message>
								)}
							</Form.Field>
						</div>

						{/* Subject */}
						<Form.Field className="contact__form-field" name="subject">
							<Form.Label className="contact__form-label">
								{dictionary.form.subject}
							</Form.Label>
							<Form.Control asChild>
								<input
									className="contact__form-input"
									{...register("subject")}
									aria-invalid={errors.subject ? "true" : "false"}
									data-required="true"
								/>
							</Form.Control>
							{errors.subject && (
								<Form.Message className="contact__form-error">
									{errors.subject.message}
								</Form.Message>
							)}
						</Form.Field>

						{/* Message */}
						<Form.Field
							className="contact__form-field contact__form-field-textarea"
							name="message">
							<Form.Label className="contact__form-label">
								{dictionary.form.message}
							</Form.Label>
							<Form.Control asChild>
								<textarea
									className="contact__form-textarea"
									{...register("message")}
									aria-invalid={errors.message ? "true" : "false"}
									data-required="true"
								/>
							</Form.Control>
							{errors.message && (
								<Form.Message className="contact__form-error">
									{errors.message.message}
								</Form.Message>
							)}
						</Form.Field>

						{/* GDPR Consent */}
						<Form.Field
							className="contact__form-field contact__form-field--checkbox"
							name="gdprConsent">
							<div className="contact__form-gdpr-text">
								<p>
									{dictionary.form.gdpr.text}{" "}
									<Link
										href="/privacy-policy"
										className="contact__form-gdpr-link">
										{dictionary.form.gdpr.privacyLink}
									</Link>
								</p>
							</div>
							<div className="contact__form-gdpr-consent">
								<Form.Control asChild>
									<input
										type="checkbox"
										{...register("gdprConsent")}
										aria-invalid={errors.gdprConsent ? "true" : "false"}
									/>
								</Form.Control>
								<Form.Label className="contact__form-label">
									{dictionary.form.gdpr.checkbox}
								</Form.Label>
							</div>
							{errors.gdprConsent && (
								<Form.Message className="contact__form-error">
									{errors.gdprConsent.message}
								</Form.Message>
							)}
						</Form.Field>

						{/* Submit button */}
						<Form.Submit asChild>
							<button
								className="contact__form-submit"
								type="submit"
								disabled={isLoading}
								aria-busy={isLoading}>
								{isLoading ? dictionary.form.sending : dictionary.form.submit}
							</button>
						</Form.Submit>
					</Form.Root>
				</div>

				<Toaster
					position="top-center"
					reverseOrder={false}
					gutter={8}
					toastOptions={{
						className: "contact__toast",
						success: {
							style: {
								background: "var(--color-success)",
								color: "var(--color-text-light)",
							},
						},
						error: {
							style: {
								background: "var(--color-error)",
								color: "var(--color-text-light)",
							},
						},
					}}
				/>
			</section>
		</>
	);
}
