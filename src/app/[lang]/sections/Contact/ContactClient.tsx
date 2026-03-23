/** @format */

"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Toaster, toast } from "react-hot-toast";
import Script from "next/script";
import { generateMetadata } from "../../../../utils/metadata";
import { ContactProps, FormData } from "../../../../types";
import { ContactForm } from "./components/ContactForm";

declare global {
	interface Window {
		SpentriaLoader?: { show: () => void; hide: () => void };
	}
}

// Minimum French phone number validation
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export default function ContactClient({ dictionary, lang }: ContactProps) {
	const [isLoading, setIsLoading] = useState(false);

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

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	const solvePoW = (
		nonce: string,
		difficulty: number
	): Promise<string> => {
		return new Promise((resolve, reject) => {
			const worker = new Worker("/workers/spentria-pow.js");
			worker.onmessage = (e) => {
				if (e.data.solution) {
					worker.terminate();
					resolve(e.data.solution);
				}
			};
			worker.onerror = (err) => {
				worker.terminate();
				reject(err);
			};
			worker.postMessage({ nonce, difficulty });
		});
	};

	const submitToApi = async (
		formData: FormData,
		metadata: { date: string; heure: string; langue: string },
		proof?: { challenge_id: string; solution: string }
	) => {
		return fetch("/api/contact", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...formData,
				...metadata,
				...(proof && { proof }),
			}),
		});
	};

	const onSubmit = async (formData: FormData) => {
		setIsLoading(true);
		setTimeout(() => window.SpentriaLoader?.show(), 0);
		try {
			const metadata = generateMetadata(lang);

			let response = await submitToApi(formData, metadata);
			let data = await response.json();

			// Handle PoW challenge
			if (response.ok && data.powRequired) {
				const { challenge } = data;
				console.log("Spentria PoW: challenge received, difficulty:", challenge.difficulty);
				const solution = await solvePoW(challenge.nonce, challenge.difficulty);
				console.log("Spentria PoW: solved, retrying submission");
				const proof = {
					challenge_id: challenge.challenge_id,
					solution,
				};
				response = await submitToApi(formData, metadata, proof);
				data = await response.json();
			}

			if (response.ok && data.success) {
				toast.success(dictionary.form.success);
				reset();
			} else if (!data.powRequired) {
				throw new Error(data.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(dictionary.form.error);
		} finally {
			window.SpentriaLoader?.hide();
			setIsLoading(false);
		}
	};

	return (
		<section id="contact" className="contact">
			<Script
				src="https://spentria.lostintab.com/widget/loader.js?v=2"
				strategy="afterInteractive"
			/>
			<div className="contact__container">
				<ContactForm
					onSubmit={handleSubmit(onSubmit)}
					register={register}
					errors={errors}
					dictionary={dictionary}
					isLoading={isLoading}
					lang={lang}
				/>
			</div>
			<div data-spentria-loader data-spentria-display="overlay"></div>
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
	);
}
