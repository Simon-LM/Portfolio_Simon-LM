/** @format */
import { ContactDictionary } from "@/types/form/contact";

interface RecaptchaConsentProps {
	dictionary: ContactDictionary;
	onAccept: () => void;
	// onDecline: () => void;
}

export const ConsentModal = ({
	dictionary,
	onAccept,
}: // onDecline,
RecaptchaConsentProps) => (
	// <div
	// 	className="contact__consent"
	// 	role="dialog"
	// 	aria-modal="true"
	// 	aria-labelledby="consent-title">
	// 	<h3 id="consent-title" className="contact__consent-title">
	// 		{dictionary.form.recaptcha.consent.title}
	// 	</h3>
	// 	<p className="contact__consent-text">
	// 		{dictionary.form.recaptcha.consent.description}
	// 	</p>
	// 	<div className="contact__consent-buttons">
	// 		<button
	// 			onClick={onAccept}
	// 			className="contact__consent-button contact__consent-button--accept">
	// 			{dictionary.form.recaptcha.consent.accept}
	// 		</button>
	// 	</div>
	// </div>

	<div
		className="contact__consent"
		role="dialog"
		aria-modal="true"
		aria-labelledby="consent-title">
		<h3 id="consent-title" className="contact__consent-title">
			{dictionary.form.recaptcha.consent.title}
		</h3>
		<p className="contact__consent-text">
			{dictionary.form.recaptcha.consent.description}
		</p>
		<div className="contact__consent-buttons">
			<button
				onClick={onAccept}
				className="contact__consent-button contact__consent-button--accept">
				{dictionary.form.recaptcha.consent.accept}
			</button>
		</div>
		<p className="contact__consent-alternative">
			{dictionary.form.recaptcha.consent.alternative}{" "}
			<a
				href={dictionary.social.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				className="contact__consent-link">
				LinkedIn
			</a>
		</p>
	</div>
);
