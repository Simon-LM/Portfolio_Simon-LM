/** @format */
import { ContactDictionary } from "@/types/form/contact";
import { useConsentStore } from "../hooks/useConsentState";

interface RecaptchaConsentProps {
	dictionary: ContactDictionary;
	onAccept: () => void;
	onDecline: () => void;
	role: string;
	// onDecline: () => void;
}

export const ConsentModal = ({
	dictionary,
	onAccept,
	onDecline,
}: RecaptchaConsentProps) => {
	const setConsent = useConsentStore((state) => state.setConsent);

	const handleAccept = () => {
		setConsent(true);
		onAccept();
	};

	return (
		<div
			className="contact__consent"
			role="dialog"
			aria-modal="true"
			// aria-labelledby="consent-title consent-description consent-alternative"
			aria-labelledby="consent-title"
			aria-describedby="consent-description consent-alternative"
			tabIndex={-1}>
			<h3 id="consent-title" className="contact__consent-title">
				{dictionary.form.recaptcha.consent.title}
			</h3>
			<p id="consent-description" className="contact__consent-text">
				{dictionary.form.recaptcha.consent.description}
			</p>

			<p id="consent-alternative" className="contact__consent-alternative">
				{dictionary.form.recaptcha.consent.alternative}{" "}
				<a
					href={dictionary.social.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					className="contact__consent-link">
					LinkedIn
				</a>
			</p>

			<div className="contact__consent-buttons">
				<button
					id="consent-accept"
					// onClick={onAccept}
					onClick={handleAccept}
					className="contact__consent-button contact__consent-button--accept"
					aria-label={dictionary.form.recaptcha.consent.accept}>
					{dictionary.form.recaptcha.consent.accept}
				</button>
				<button
					id="consent-decline"
					onClick={onDecline}
					className="contact__consent-button contact__consent-button--decline"
					aria-label={dictionary.form.recaptcha.consent.decline || "Decline"}>
					{dictionary.form.recaptcha.consent.decline || "Decline"}
				</button>
			</div>
			{/* <p id="consent-alternative" className="contact__consent-alternative">
				{dictionary.form.recaptcha.consent.alternative}{" "}
				<a
					href={dictionary.social.linkedin}
					target="_blank"
					rel="noopener noreferrer"
					className="contact__consent-link">
					LinkedIn
				</a>
			</p> */}
		</div>
	);
};
