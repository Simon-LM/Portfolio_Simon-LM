/** @format */

"use client";

import { useLanguageStore } from "../../../store/langueStore";
// import { useEffect, useState } from "react";
import Header from "../../../components/header/Header";
import NavigationSticky from "../../../components/navigationSticky/NavigationSticky";
import StickyFooter from "../../../components/stickyFooter/StickyFooter";
import BottomFooter from "../../../components/bottomFooter/BottomFooter";
import Link from "next/link";

export default function SiteMapClient({ initialDictionary }: any) {
	const { language } = useLanguageStore();

	return (
		<>
			<Header dictionary={initialDictionary} />
			<NavigationSticky />
			<main className="sitemap" id="main-content">
				<h1 className="sitemap__title">
					{language === "fr" ? "Plan du site" : "Site Map"}
				</h1>

				{/* Arborescence visuelle */}
				<div className="sitemap__tree" aria-hidden="true">
					<svg viewBox="0 0 1000 600">
						{/* Niveau 1 - Accueil */}
						<text x="500" y="50" className="sitemap__text">
							{language === "fr" ? "Accueil" : "Home"}
						</text>
						<line
							x1="500"
							y1="60"
							x2="500"
							y2="100"
							className="sitemap__line"
						/>

						{/* Niveau 2 - Sections principales */}
						<text x="250" y="150">
							{language === "fr"
								? "Pourquoi l'accessibilité"
								: "Why Accessibility"}
						</text>
						<text x="500" y="150">
							Portfolio
						</text>
						<text x="750" y="150">
							Contact
						</text>
						<line
							x1="250"
							y1="160"
							x2="750"
							y2="160"
							className="sitemap__line"
						/>

						{/* Niveau 3 - Pages légales */}
						<text x="200" y="250">
							{language === "fr" ? "Mentions légales" : "Legal Notice"}
						</text>
						<text x="400" y="250">
							{language === "fr" ? "CGU" : "Terms"}
						</text>
						<text x="600" y="250">
							{language === "fr" ? "Confidentialité" : "Privacy"}
						</text>
						<text x="800" y="250">
							{language === "fr" ? "Accessibilité" : "Accessibility"}
						</text>
					</svg>
				</div>

				{/* Liste de liens hiérarchique */}
				<nav className="sitemap__nav" aria-label="Plan du site">
					<ul className="sitemap__list">
						<li>
							<Link href={`/${language}`} className="sitemap__link">
								{language === "fr" ? "Accueil" : "Home"}
							</Link>
							<ul>
								<li>
									<Link href={`/${language}/#about`} className="sitemap__link">
										{language === "fr"
											? "Pourquoi l'accessibilité"
											: "Why Accessibility"}
									</Link>
								</li>
								<li>
									<Link href={`/${language}/#skills`} className="sitemap__link">
										{language === "fr" ? "Compétences" : "Skills"}
									</Link>
								</li>
								<li>
									<Link
										href={`/${language}/#portfolio`}
										className="sitemap__link">
										Portfolio
									</Link>
								</li>
								<li>
									<Link
										href={`/${language}/#contact`}
										className="sitemap__link">
										Contact
									</Link>
								</li>
							</ul>
						</li>
						<li>
							<span>{language === "fr" ? "Pages légales" : "Legal pages"}</span>
							<ul>
								<li>
									<Link href={`/${language}/legal`} className="sitemap__link">
										{language === "fr" ? "Mentions légales" : "Legal Notice"}
									</Link>
								</li>
								<li>
									<Link href={`/${language}/terms`} className="sitemap__link">
										{language === "fr" ? "CGU" : "Terms"}
									</Link>
								</li>
								<li>
									<Link
										href={`/${language}/privacy-policy`}
										className="sitemap__link">
										{language === "fr" ? "Confidentialité" : "Privacy"}
									</Link>
								</li>
								<li>
									<Link
										href={`/${language}/accessibility`}
										className="sitemap__link">
										{language === "fr" ? "Accessibilité" : "Accessibility"}
									</Link>
								</li>
							</ul>
						</li>
					</ul>
				</nav>
			</main>
			<StickyFooter />
			<BottomFooter />
		</>
	);
}
