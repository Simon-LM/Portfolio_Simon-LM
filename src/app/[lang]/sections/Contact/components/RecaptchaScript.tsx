/** @format */

import Script from "next/script";

// export const RecaptchaScript = () => (
// 	<Script
// 		src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}&badge=bottomleft`}
// 		strategy="afterInteractive"
// 	/>
// );

export const RecaptchaScript = () => (
	<>
		<Script
			src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}&badge=bottomleft`}
			strategy="afterInteractive"
		/>
		<style jsx global>{`
		.g-recaptcha-response {
		  display: none !important;
		  position: absolute;
		  margin: -50px 0 0 -50px;
		  z-index: -999999;
		  opacity: 0;
		}
		iframe[src*="recaptcha"] {
		  display: none;
		  position: absolute;
		  margin: -50px 0 0 -50px;
		  z-index: -999999;
		  opacity: 0;
		}
		iframe[style*="display: none"] {
		  display: none !important;
		  title: "reCAPTCHA challenge";
		  aria-hidden="true";
		}
	  `}</style>
	</>
);
