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
	const [shouldLoad, setShouldLoad] = useState(false);
	const { ref, inView } = useInView({ triggerOnce: true });
	const [showContact, setShowContact] = useState(false);
	const [hasConsent, setHasConsent] = useState<boolean | null>(null);

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

	const handleAcceptConsent = () => {
		setHasConsent(true);
	};

	return (
		<section id="contact" className="contact" ref={ref}>
			{(showContact || shouldLoad) && (
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
