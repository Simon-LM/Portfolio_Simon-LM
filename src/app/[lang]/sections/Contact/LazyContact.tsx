/** @format */

"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { ContactDictionary } from "@/types/form/contact";
import { ConsentModal } from "./components/ConsentModal";

const ContactClient = dynamic(() => import("./ContactClient"), {
	ssr: false,
});

interface LazyContactProps {
	dictionary: ContactDictionary;
	lang: string;
}

export const LazyContact = ({ dictionary, lang }: LazyContactProps) => {
	const { ref, inView } = useInView({ triggerOnce: true });
	const [showContact, setShowContact] = useState(false);
	const [hasConsent, setHasConsent] = useState<boolean | null>(null);

	useEffect(() => {
		if (inView) {
			setShowContact(true);
		}
	}, [inView]);

	const handleAcceptConsent = () => {
		setHasConsent(true);
	};

	// const handleDeclineConsent = () => {
	// 	setHasConsent(false);
	// };

	return (
		// <section id="contact" className="contact" ref={ref}>
		// 	{!showContact && (
		// 		<div className="contact__placeholder">
		// 			<div className="contact__loading">
		// 				{dictionary.loading || "Loading..."}
		// 			</div>
		// 		</div>
		// 	)}
		// 	{showContact && <ContactClient dictionary={dictionary} lang={lang} />}
		// </section>

		// <section id="contact" className="contact" ref={ref}>
		// 	{!showContact ? (
		// 		<div className="contact__placeholder">
		// 			<div className="contact__loading">
		// 				{dictionary.loading || "Loading..."}
		// 			</div>
		// 		</div>
		// 	) : !hasConsent ? (
		// 		<div className="contact__container">
		// 			<h2 className="contact__title">{dictionary.title}</h2>
		// 			<ConsentModal
		// 				dictionary={dictionary}
		// 				onAccept={handleAcceptConsent}
		// 				// onDecline={handleDeclineConsent}
		// 			/>
		// 		</div>
		// 	) : hasConsent === true ? (
		// 		<ContactClient dictionary={dictionary} lang={lang} />
		// 	) : (
		// 		<div className="contact__declined">
		// 			<p>{dictionary.form.recaptcha.consent.declinedMessage}</p>
		// 			<a
		// 				href={dictionary.social.linkedin}
		// 				target="_blank"
		// 				rel="noopener noreferrer"
		// 				className="contact__declined-link">
		// 				{dictionary.form.recaptcha.consent.linkedinAlternative}
		// 			</a>
		// 		</div>
		// 	)}
		// </section>

		<section id="contact" className="contact" ref={ref}>
			{showContact && (
				<div className="contact__container">
					<h2 className="contact__title">{dictionary.title}</h2>
					<div
						className={`contact__form-wrapper ${
							!hasConsent ? "contact__form-wrapper--blocked" : ""
						}`}>
						<ContactClient
							dictionary={dictionary}
							lang={lang}
							hasConsent={hasConsent}
						/>
					</div>

					{!hasConsent && (
						<>
							<div className="contact__overlay" />
							<ConsentModal
								dictionary={dictionary}
								onAccept={handleAcceptConsent}
							/>
						</>
					)}
				</div>
			)}
		</section>
	);
};
