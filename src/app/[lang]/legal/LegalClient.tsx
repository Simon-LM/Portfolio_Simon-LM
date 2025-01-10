/** @format */

"use client";

import { useLanguageStore } from "../../../store/langueStore";
import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import NavigationSticky from "../../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";
import Link from "next/link";

interface LegalSection {
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
		legal: {
			title: string;
			lastUpdate: string;
			sections: {
				[key: string]: LegalSection;
			};
		};
	};
}

export default function LegalClient({
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
			<main className="legal" id="main-content">
				<h1 className="legal__title">{dictionary.sections.legal.title}</h1>
				<p className="legal__update">{dictionary.sections.legal.lastUpdate}</p>
				{Object.entries(dictionary.sections.legal.sections).map(
					([key, section]: [string, LegalSection]) => (
						<section key={key} className="legal__section">
							<h2 className="legal__section-title">{section.title}</h2>
							<p className="legal__section-content">
								{key === "contact" ? (
									<>
										{section.content}{" "}
										<Link
											href={`/${language}/#contact`}
											className="legal__link">
											Contact
										</Link>
									</>
								) : (
									section.content
								)}
							</p>
							{/* {section.items && (
								<ul className="legal__section-list">
									{section.items.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							)} */}

							{section.items && (
								<ul className="legal__section-list">
									{section.items.map((item, index) => (
										<li key={index}>
											{item.includes("E-mail :") ? (
												<>
													E-mail :{" "}
													<Link
														href={`/${language}/#contact`}
														className="legal__link">
														Formulaire de contact
													</Link>
												</>
											) : (
												item
											)}
										</li>
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
