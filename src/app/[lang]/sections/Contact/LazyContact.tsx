/** @format */

"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { ContactDictionary } from "@/types/form/contact";

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

	useEffect(() => {
		const portfolioSection = document.getElementById("portfolio");

		const handlePortfolioFocus = () => {
			// showContact triggers loading via focus; inView handles the scroll case
			setShowContact(true);
		};

		if (portfolioSection) {
			portfolioSection.addEventListener("focus", handlePortfolioFocus);
			portfolioSection.addEventListener("focusin", handlePortfolioFocus);
		}

		return () => {
			if (portfolioSection) {
				portfolioSection.removeEventListener("focus", handlePortfolioFocus);
				portfolioSection.removeEventListener("focusin", handlePortfolioFocus);
			}
		};
	}, []);

	return (
		<section id="contact" className="contact" ref={ref}>
			{(showContact || inView) && (
				<div className="contact__container">
					<h2 id="contactTitle" tabIndex={0} className="contact__title">
						{dictionary.title}
					</h2>

					<div className="contact__form-wrapper">
						<ContactClient dictionary={dictionary} lang={lang} />
					</div>
				</div>
			)}
		</section>
	);
};
