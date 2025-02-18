/** @format */

"use client";

import { useEffect, useState, useRef } from "react";
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
	const [shouldLoad, setShouldLoad] = useState(false);
	const { ref, inView } = useInView({ triggerOnce: true });
	const [showContact, setShowContact] = useState(false);
	const [hasConsent, setHasConsent] = useState<boolean | null>(null);

	// Référence pour le titre de la section contact
	const contactTitleRef = useRef<HTMLHeadingElement>(null);
	// Référence pour le texte d'information lors du refus
	const consentInfoRef = useRef<HTMLParagraphElement>(null);
	// Référence pour compter les appuis sur Tab depuis le message
	const trapCountRef = useRef(0);

	// Pour informer sur l’accessibilité du formulaire
	const [consentInfo, setConsentInfo] = useState("");

	useEffect(() => {
		const portfolioSection = document.getElementById("portfolio");

		const handlePortfolioFocus = () => {
			setShouldLoad(true);
			setShowContact(true);
		};

		if (portfolioSection) {
			portfolioSection.addEventListener("focus", handlePortfolioFocus);
			portfolioSection.addEventListener("focusin", handlePortfolioFocus);

			// For Edge
			// portfolioSection.addEventListener("click", handlePortfolioFocus);
		}

		return () => {
			if (portfolioSection) {
				portfolioSection.removeEventListener("focus", handlePortfolioFocus);
				portfolioSection.removeEventListener("focusin", handlePortfolioFocus);
				// For Edge
				// portfolioSection.removeEventListener("click", handlePortfolioFocus);
			}
		};
	}, []);

	useEffect(() => {
		if (inView) {
			setShouldLoad(true);
		}
	}, [inView]);

	// useEffect(() => {
	// 	if (!hasConsent && consentInfoRef.current) {
	// 		consentInfoRef.current.focus();
	// 	}
	// }, [hasConsent]);

	const handleAcceptConsent = () => {
		setHasConsent(true);
		// Une fois accepté, on refocalise sur le titre de section
		setTimeout(() => {
			contactTitleRef.current?.focus();
		}, 0);
	};

	// Si le consentement n'est pas accordé, on peut informer l'utilisateur
	const handleNoConsent = () => {
		// setConsentInfo(
		// 	lang === "fr"
		// 		? "Vous n'avez pas accepté le consentement. Le formulaire de contact est désactivé."
		// 		: "You did not accept the consent. The contact form is disabled."
		// );
		// Rediriger le focus sur le titre de la section contact
		setTimeout(() => {
			consentInfoRef.current?.focus();
		}, 0);
	};

	return (
		<section id="contact" className="contact" ref={ref}>
			{(showContact || shouldLoad) && (
				<div className="contact__container">
					<h2
						id="contactTitle"
						ref={contactTitleRef}
						tabIndex={0}
						className="contact__title">
						{dictionary.title}
					</h2>

					<div
						// className={`contact__form-wrapper ${
						// 	!hasConsent ? "contact__form-wrapper--blocked" : ""
						// 	}`}
						className="contact__form-wrapper"
						aria-hidden={!hasConsent}
						style={!hasConsent ? { pointerEvents: "none", opacity: 0.5 } : {}}>
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
								onDecline={handleNoConsent}
								role="dialog"
								aria-modal="true"
							/>
							{/* {consentInfo && (
								<p
									ref={consentInfoRef}
									tabIndex={0}
									role="status"
									aria-live="polite"
									className="contact__consent-info">
									{consentInfo}
								</p>
							)} */}

							<p
								ref={consentInfoRef}
								tabIndex={0}
								role="status"
								aria-live="polite"
								className="contact__consent-info">
								{consentInfo ||
									(lang === "fr"
										? "Vous n'avez pas accepté le consentement. Le formulaire de contact est désactivé."
										: "You did not accept the consent. The contact form is disabled.")}
							</p>
						</>
					)}
				</div>
			)}
		</section>
	);
};
