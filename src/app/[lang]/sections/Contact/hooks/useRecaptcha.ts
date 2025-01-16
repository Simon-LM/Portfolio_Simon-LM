/** @format */

import { useEffect } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const useRecaptcha = () => {
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
