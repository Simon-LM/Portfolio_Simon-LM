/** @format */

export interface ReCaptchaRenderOptions {
	sitekey: string;
	size?: "invisible";
	badge?: "bottomright" | "bottomleft" | "inline";
	theme?: "light" | "dark";
}

export interface Window {
	grecaptcha: {
		ready: (callback: () => void) => void;
		execute: (siteKey: string, options: { action: string }) => Promise<string>;
		render: (container: string, options: ReCaptchaRenderOptions) => number;
	};
}
