/** @format */

"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Toaster, toast } from "react-hot-toast";
import { generateMetadata } from "../../../../utils/metadata";
import { ContactProps, FormData } from "../../../../types";
import { ContactForm } from "./components/ContactForm";
import { RecaptchaScript } from "./components/RecaptchaScript";
import { useRecaptcha } from "./hooks/useRecaptcha";
import { ErrorToast } from "./components/ErrorToast";

// Minimum French phone number validation
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export default function ContactClient({
	dictionary,
	lang,
	hasConsent,
}: ContactProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { executeRecaptcha } = useRecaptcha();

	// Create Zod validation schema with translated error messages
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
	// type FormData = z.infer<typeof schema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	// Handle form submission with reCAPTCHA verification
	const onSubmit = async (formData: FormData) => {
		setIsLoading(true);
		try {
			// Generate reCAPTCHA token
			const token = await executeRecaptcha();

			// Generate client-side metadata (language, date, time)
			const metadata = generateMetadata(lang);

			// Send form data to API with reCAPTCHA token and metadata
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					"g-recaptcha-response": token,
					...metadata,
				}),
			});

			const data = await response.json();

			// Handle response and show appropriate toast message
			if (response.ok) {
				toast.success(dictionary.form.success);
				reset();
			} else {
				throw new Error(data.error || "Failed to send message");
			}
		} catch (error) {
			// Handle errors and display detailed reCAPTCHA error messages
			console.error("Form submission error:", error);
			toast.error(<ErrorToast dictionary={dictionary} />);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Load reCAPTCHA script */}
			{hasConsent && <RecaptchaScript />}

			<section id="contact" className="contact">
				<div className="contact__container">
					{/* <h2 className="contact__title">{dictionary.title}</h2> */}
					<ContactForm
						onSubmit={handleSubmit(onSubmit)}
						register={register}
						errors={errors}
						dictionary={dictionary}
						isLoading={isLoading}
						lang={lang}
						isBlocked={!hasConsent}
					/>
				</div>
				<Toaster
					position="top-center"
					reverseOrder={false}
					gutter={8}
					toastOptions={{
						className: "contact__toast",
						duration: 12000,
						style: {
							background: "transparent",
							boxShadow: "none",
						},
						success: {
							style: {
								background: "$color-main-bg",
								color: "$color-main-text",
							},
						},
						error: {
							style: {
								background: "transparent",
								padding: 0,
							},
						},
					}}
				/>
			</section>
		</>
	);
}
