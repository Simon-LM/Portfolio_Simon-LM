/** @format */

import Script from "next/script";

export const RecaptchaScript = () => (
	<Script
		src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}&badge=bottomleft`}
		strategy="afterInteractive"
	/>
);
