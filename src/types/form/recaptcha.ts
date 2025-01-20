/** @format */

export interface ReCaptchaRenderOptions {
	sitekey: string;
	size?: "invisible";
	badge?: "bottomright" | "bottomleft" | "inline";
	theme?: "light" | "dark";
}

export interface ReCaptchaConsentDictionary {
	consent: {
		title: string;
		description: string;
		accept: string;
		decline: string;
		alternative: string;
		declinedMessage: string;
		linkedinAlternative: string;
	};
	error: {
		title: string;
		cause: string;
		reasons: string[];
		solutions: {
			title: string;
			items: string[];
		};
	};
}

// Déclaration globale de Window pour reCAPTCHA
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
