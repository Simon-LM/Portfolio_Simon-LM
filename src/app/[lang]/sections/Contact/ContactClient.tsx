/** @format */

"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Form from "@radix-ui/react-form";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

// import ReCAPTCHA from "react-google-recaptcha";
// import { useRef } from "react";

interface FormErrors {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
	gdpr: string;
	subject: string;
}

interface PhoneFormat {
	line1: string;
	line2: string;
}

interface GDPRContent {
	text: string;
	checkbox: string;
	privacyLink: string;
}

interface FormDictionary {
	firstName: string;
	lastName: string;
	company: string;
	phone: string;
	optional: string;
	email: string;
	subject: string;
	message: string;
	submit: string;
	sending: string;
	success: string;
	error: string;
	emailFormat: string;
	phoneFormat: PhoneFormat;
	errors: FormErrors;
	gdpr: GDPRContent;
}

interface ContactProps {
	dictionary: {
		title: string;
		subtitle: string;
		form: FormDictionary;
	};
}

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
// const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export default function ContactClient({ dictionary }: ContactProps) {
	useEffect(() => {
		emailjs.init(PUBLIC_KEY!);
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

			// recaptcha: z.string().min(1, "Veuillez cocher la case reCAPTCHA"),
		});
	};

	const schema = createValidationSchema();
	type FormData = z.infer<typeof schema>;

	// export default function ContactClient({ dictionary }: ContactProps) {
	// const recaptchaRef = useRef<ReCAPTCHA>(null);

	const {
		register,
		handleSubmit,
		// setValue,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (data: FormData) => {
		// if (!recaptchaRef.current?.getValue()) {
		// 	toast.error(dictionary.recaptcha.error);
		// 	return;
		// }
		const loadingToast = toast.loading(dictionary.form.sending);
		try {
			// Préparer les données pour EmailJS
			const templateParams = {
				firstName: data.firstName,
				lastName: data.lastName,
				phone: data.phone || "Non renseigné",
				company: data.company || "Non renseigné",
				reply_to: data.email,
				subject: data.subject,
				message: data.message,
				jsonData: JSON.stringify(
					{
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						phone: data.phone || "Non renseigné",
						company: data.company || "Non renseigné",
						subject: data.subject,
						message: data.message,
						date: new Date().toISOString(),
					},
					null,
					2
				),
			};

			// Envoyer l'email
			const response = await emailjs.send(
				SERVICE_ID!,
				TEMPLATE_ID!,
				templateParams,
				PUBLIC_KEY!
			);

			if (response.status === 200) {
				toast.success(dictionary.form.success, {
					id: loadingToast,
					duration: 4000,
				});
				reset();
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error(dictionary.form.error, {
				id: loadingToast,
				duration: 4000,
			});
		}
	};

	return (
		<motion.section id="contact" className="contact">
			<div className="contact__container">
				<h2 className="contact__title">{dictionary.title}</h2>
				{/* <p className="contact__subtitle">{dictionary.subtitle}</p> */}

				<Form.Root className="contact__form" onSubmit={handleSubmit(onSubmit)}>
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
					<div className="contact__form-fields">
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
						{/* </div>

					<div className="contact__form-fields"> */}

						<Form.Field className="contact__form-field" name="company">
							{/* <Form.Label className="contact__form-label">
								{dictionary.form.company}
							</Form.Label> */}
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

						{/* <Form.Field className="contact__form-field" name="phone">
							<Form.Label className="contact__form-label">
								{dictionary.form.phone}
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
						</Form.Field> */}

						<Form.Field className="contact__form-field" name="phone">
							{/* <Form.Label className="contact__form-label">
								{dictionary.form.phone}
							</Form.Label> */}
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
					{/* <div className="contact__form-fields"> */}
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
					{/* </div> */}
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
					<Form.Submit asChild>
						<button className="contact__form-submit" type="submit">
							{dictionary.form.submit}
						</button>
					</Form.Submit>
				</Form.Root>

				{/* <div className="contact__email-wrapper">
					<a href={`mailto:${dictionary.email}`} className="contact__email">
						{dictionary.email}
					</a>
				</div> */}
			</div>
			<div className="contact__form-recaptcha">
				{/* <ReCAPTCHA
					ref={recaptchaRef}
					sitekey={RECAPTCHA_SITE_KEY!}
					onChange={(value: string | null) =>
						setValue("recaptcha", value || "")
					}
					theme="light"
					size="normal"
				/> */}
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
		</motion.section>
	);
}
