/** @format */

"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useLanguageStore } from "../../../store/langueStore";
import Header from "../../../components/header/Header";
import NavigationSticky from "../../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";
import Link from "next/link";

interface AccessibilitySection {
	title: string;
	content: string;
	items?: string[];
	link?: {
		text: string;
		url: string;
	};
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
		accessibility: {
			title: string;
			lastUpdate: string;
			sections: {
				[key: string]: AccessibilitySection;
			};
		};
	};
}

export default function AccessibilityClient({
	initialDictionary,
}: {
	initialDictionary: Dictionary;
}) {
	const { language } = useLanguageStore();
	const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary);

	const contactText = {
		fr: "via le formulaire de contact",
		en: "through the contact form",
	};

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
			<main className="accessibility">
				<h1 className="accessibility__title">
					{dictionary.sections.accessibility.title}
				</h1>
				<p className="accessibility__update">
					{dictionary.sections.accessibility.lastUpdate}
				</p>
				{Object.entries(dictionary.sections.accessibility.sections).map(
					([key, section]: [string, AccessibilitySection]) => (
						<section key={key} className="accessibility__section">
							<h2 className="accessibility__section-title">{section.title}</h2>

							{key === "contact" ? (
								<div className="accessibility__section-content">
									<p>
										{section.content
											.split(contactText[language as "fr" | "en"])
											.map((text, index, array) => {
												if (index === array.length - 1) {
													return text;
												}
												return (
													<React.Fragment key={index}>
														{text}
														<Link
															href={`/${language}/#contact`}
															className="accessibility__link">
															{contactText[language as "fr" | "en"]}
														</Link>
													</React.Fragment>
												);
											})}
									</p>
								</div>
							) : (
								<div className="accessibility__section-content">
									<p>{section.content}</p>
									{section.items && (
										<ul className="accessibility__section-list">
											{section.items.map((item, index) => (
												<li key={index}>{item}</li>
											))}
										</ul>
									)}
								</div>
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
