/** @format */

"use client";

import { useLanguageStore } from "../../../store/langueStore";
import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import NavigationSticky from "../../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";
import Link from "next/link";
import Script from "next/script";

interface PrivacySection {
	title: string;
	content: string;
	items?: string[];
	errorMessage?: string;
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
		privacy: {
			title: string;
			lastUpdate: string;
			sections: {
				[key: string]: PrivacySection;
			};
		};
	};
}

export default function PrivacyPolicyClient({
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
			<main className="privacy-policy" id="main-content">
				<h1 className="privacy-policy__title">
					{dictionary.sections.privacy.title}
				</h1>

				<p className="privacy-policy__update">
					{dictionary.sections.privacy.lastUpdate}
				</p>
				{Object.entries(dictionary.sections.privacy.sections).map(
					([key, section]: [string, PrivacySection]) => (
						<section key={key} className="privacy-policy__section">
							<h2 className="privacy-policy__section-title">{section.title}</h2>
							<p>
								{key === "contact" ? (
									<>
										{section.content}{" "}
										<Link
											href={`/${language}/#contact`}
											className="privacy-policy__link">
											Contact
										</Link>
									</>
								) : (
									section.content
								)}
							</p>
							{section.items && (
								<ul className="privacy-policy__section-list">
									{section.items.map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							)}

							{key === "optOut" && (
								<>
									<div
										id="matomo-opt-out"
										className="privacy-policy__opt-out"></div>
									<Script
										id="matomo-opt-out-script"
										strategy="lazyOnload"
										src={`https://analytics.lostintab.com/index.php?module=CoreAdminHome&action=optOutJS&divId=matomo-opt-out&language=${language}&showIntro=1`}
										onLoad={() => console.log("Matomo opt-out loaded")}
										onError={(e) => {
											console.error("Failed to load Matomo opt-out", e);
											const element = document.getElementById("matomo-opt-out");
											if (element) {
												element.innerHTML = `<p>${
													dictionary.sections.privacy.sections.optOut
														.errorMessage || ""
												}</p>`;
											}
										}}
									/>
								</>
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
