/** @format */

import { useEffect } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const useRecaptcha = () => {
	useEffect(() => {
		const loadReCaptcha = () => {
			window.grecaptcha?.ready(() => {
				console.log("reCAPTCHA v3 is ready");

				// Improve textarea accessibility
				const textarea = document.querySelector(".g-recaptcha-response");
				if (textarea) {
					textarea.setAttribute("aria-label", "reCAPTCHA challenge response");
					textarea.setAttribute("aria-hidden", "true");
					textarea.setAttribute("title", "reCAPTCHA response field");
				}

				// Improve iframe accessibility
				const iframe = document.querySelector('iframe[src*="recaptcha"]');
				if (iframe) {
					iframe.setAttribute("title", "reCAPTCHA challenge");
					iframe.setAttribute("aria-hidden", "true");
				}
			});
		};

		if (typeof window !== "undefined" && window.grecaptcha) {
			loadReCaptcha();
		}
	}, []);

	const executeRecaptcha = async () => {
		try {
			const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY || "", {
				action: "submit_contact",
			});
			console.log("reCAPTCHA token generated");
			return token;
		} catch (error) {
			console.error("reCAPTCHA execution error details:", error);
			throw error;
		}
	};

	return { executeRecaptcha };
};
