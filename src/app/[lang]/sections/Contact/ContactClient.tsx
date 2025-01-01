/** @format */

"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Form from "@radix-ui/react-form";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

interface ContactProps {
	dictionary: {
		title: string;
		subtitle: string;
		form: {
			firstName: string;
			lastName: string;
			company: string;
			email: string;
			message: string;
			submit: string;
			sending: string;
			success: string;
			error: string;
		};
		recaptcha: {
			error: string;
		};
	};
}

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const schema = z.object({
	firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
	lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
	company: z.string().optional(),
	email: z.string().email("Email invalide"),
	message: z
		.string()
		.min(10, "Le message doit contenir au moins 10 caractères"),
	honeypot: z.string().max(0, "Champ non valide"),
	// recaptcha: z.string().min(1, "Veuillez cocher la case reCAPTCHA"),
});

type FormData = z.infer<typeof schema>;

export default function ContactClient({ dictionary }: ContactProps) {
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	const {
		register,
		handleSubmit,
		setValue,
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
			// Créer le fichier JSON
			const jsonData = JSON.stringify(data);
			const blob = new Blob([jsonData], { type: "application/json" });
			const file = new File([blob], "contact-form.json", {
				type: "application/json",
			});

			// Préparer les données pour EmailJS
			const templateParams = {
				firstName: data.firstName,
				lastName: data.lastName,
				company: data.company || "Non renseigné",
				reply_to: data.email,
				message: data.message,
				attachment: file,
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
								/>
							</Form.Control>
							{errors.lastName && (
								<Form.Message className="contact__form-error">
									{errors.lastName.message}
								</Form.Message>
							)}
						</Form.Field>
					</div>
					<div className="contact__form-fields">
						<Form.Field className="contact__form-field" name="company">
							<Form.Label className="contact__form-label">
								{dictionary.form.company}
							</Form.Label>
							<Form.Control asChild>
								<input
									className="contact__form-input"
									{...register("company")}
								/>
							</Form.Control>
						</Form.Field>

						<Form.Field className="contact__form-field" name="email">
							<Form.Label className="contact__form-label">
								{dictionary.form.email}
							</Form.Label>
							<Form.Control asChild>
								<input
									className="contact__form-input"
									type="email"
									{...register("email")}
									aria-invalid={errors.email ? "true" : "false"}
								/>
							</Form.Control>
							{errors.email && (
								<Form.Message className="contact__form-error">
									{errors.email.message}
								</Form.Message>
							)}
						</Form.Field>
					</div>
					{/* <div className="contact__form-fields"> */}
					<Form.Field className="contact__form-field" name="message">
						<Form.Label className="contact__form-label">
							{dictionary.form.message}
						</Form.Label>
						<Form.Control asChild>
							<textarea
								className="contact__form-textarea"
								{...register("message")}
								aria-invalid={errors.message ? "true" : "false"}
							/>
						</Form.Control>
						{errors.message && (
							<Form.Message className="contact__form-error">
								{errors.message.message}
							</Form.Message>
						)}
					</Form.Field>
					{/* </div> */}
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
