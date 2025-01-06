/** @format */

"use client";

import { useLanguageStore } from "../../../store/langueStore";
import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import NavigationSticky from "../../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";

interface TermsSection {
	title: string;
	content: string;
	items?: string[];
}

interface Dictionary {
	header: {
		title: {
			name: string;
			role: string;
		};
		blog: string;
		accessibilityIcon: {
			alt: string;
			title: string;
		};
	};
	sections: {
		terms: {
			title: string;
			lastUpdate: string;
			sections: {
				[key: string]: TermsSection;
			};
		};
	};
}

export default function TermsClient({
	initialDictionary,
}: {
	initialDictionary: Dictionary;
}) {
	const { language } = useLanguageStore();
	const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary);

	useEffect(() => {
		const loadDictionary = async () => {
			const response = await fetch(`/api/dictionary?lang=${language}`);
			const newDictionary = await response.json();
			setDictionary(newDictionary);
		};
		if (language) {
			loadDictionary();
		}
	}, [language]);

	return (
		<>
			<Header dictionary={dictionary} />
			<NavigationSticky />
			<main className="terms">
				<h1 className="terms__title">{dictionary.sections.terms.title}</h1>
				<p className="terms__update">{dictionary.sections.terms.lastUpdate}</p>
				{Object.entries(dictionary.sections.terms.sections).map(
					([key, section]: [string, TermsSection]) => (
						<section key={key} className="terms__section">
							<h2 className="terms__section-title">{section.title}</h2>
							<p className="terms__section-content">{section.content}</p>
							{section.items && (
								<ul className="terms__section-list">
									{section.items.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							)}
						</section>
					)
				)}
			</main>
			<StickyFooter />
			<BottomFooter />
		</>
	);
}
