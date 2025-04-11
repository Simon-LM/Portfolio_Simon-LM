/** @format */

"use client";

import React from "react";
import Link from "next/link";
import {
	FaLinkedin,
	FaXTwitter,
	FaYoutube,
	FaGithub,
	FaRss,
} from "react-icons/fa6";
import { useLanguageStore } from "../../store/langueStore";
import { useCursorNavigation } from "../../hooks/useCursorNavigation";

// import { useScrollNavigation } from "../../hooks/useScrollNavigation";

export default function BottomFooter() {
	const { language } = useLanguageStore();
	const isCursorNavigationEnabled = useCursorNavigation();
	// const { handleNavigation } = useScrollNavigation();

	const translations = {
		fr: {
			legal: {
				title: "Informations légales",
				sitemap: "Plan du site",
				mentions: "Mentions légales",
				terms: "CGU",
				privacy: "Politique de confidentialité",
				accessibility: "Accessibilité : Déclaration de conformité ",
			},
			navigation: {
				title: "Navigation",
				home: "Accueil",
				why: "Pourquoi l'accessibilité",
				skills: "Compétences",
				portfolio: "Portfolio",
				contact: "Contact",
			},
			resources: {
				title: "Ressources & Réseaux",
				rss: "Flux RSS",
			},
		},
		en: {
			legal: {
				title: "Legal Information",
				sitemap: "Site Map",
				mentions: "Legal Notice",
				terms: "Terms",
				privacy: "Privacy Policy",
				accessibility: "Accessibility : compliance statement",
			},
			navigation: {
				title: "Navigation",
				home: "Home",
				why: "Why Accessibility",
				skills: "Skills",
				portfolio: "Portfolio",
				contact: "Contact",
			},
			resources: {
				title: "Resources & Social",
				rss: "RSS Feed",
			},
		},
	};

	const t = translations[language];

	const handleNavClick = (elementId: string) => {
		const targetElement = document.getElementById(elementId);
		if (targetElement) {
			targetElement.setAttribute("tabindex", "-1");
			targetElement.focus();
			targetElement.addEventListener(
				"blur",
				() => {
					targetElement.removeAttribute("tabindex");
				},
				{ once: true }
			);
		}
	};

	// const handleKeyDown = (event: React.KeyboardEvent) => {
	// 	if (isCursorNavigationEnabled) {
	// 		return;
	// 	}

	// 	if (
	// 		!(
	// 			event.key === "ArrowDown" ||
	// 			event.key === "ArrowUp" ||
	// 			event.key === "ArrowLeft" ||
	// 			event.key === "ArrowRight"
	// 		)
	// 	) {
	// 		return;
	// 	}
	// 	event.preventDefault();

	// 	const groups = document.querySelectorAll(".bottomFooter__group");
	// 	const currentGroup = (event.target as HTMLElement).closest(
	// 		".bottomFooter__group"
	// 	);
	// 	const groupIndex = Array.from(groups).indexOf(currentGroup as Element);

	// 	if (event.key === "ArrowDown" || event.key === "ArrowUp") {
	// 		const links = currentGroup?.querySelectorAll("a");
	// 		if (!links?.length) return;

	// 		const currentIndex = Array.from(links).indexOf(
	// 			event.target as HTMLElement
	// 		);
	// 		if (currentIndex === -1) return;

	// 		const nextIndex =
	// 			event.key === "ArrowDown"
	// 				? (currentIndex + 1) % links.length
	// 				: (currentIndex - 1 + links.length) % links.length;

	// 		(links[nextIndex] as HTMLElement).focus();
	// 	} else {
	// 		const nextGroupIndex =
	// 			event.key === "ArrowRight"
	// 				? (groupIndex + 1) % groups.length
	// 				: (groupIndex - 1 + groups.length) % groups.length;

	// 		const firstLink = groups[nextGroupIndex]?.querySelector("a");
	// 		firstLink?.focus();
	// 	}
	// };

	const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
		if (isCursorNavigationEnabled) {
			return;
		}

		if (
			!(
				event.key === "ArrowDown" ||
				event.key === "ArrowUp" ||
				event.key === "ArrowLeft" ||
				event.key === "ArrowRight"
			)
		) {
			return;
		}
		event.preventDefault();

		const groups = document.querySelectorAll(".bottomFooter__group");
		const currentGroup = (event.target as HTMLAnchorElement).closest(
			".bottomFooter__group"
		);
		const groupIndex = Array.from(groups).indexOf(currentGroup as Element);

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			const links = currentGroup?.querySelectorAll<HTMLAnchorElement>("a");
			if (!links?.length) return;

			const currentIndex = Array.from(links).indexOf(
				event.target as HTMLAnchorElement
			);
			if (currentIndex === -1) return;

			const nextIndex =
				event.key === "ArrowDown"
					? (currentIndex + 1) % links.length
					: (currentIndex - 1 + links.length) % links.length;

			links[nextIndex].focus();
		} else {
			const nextGroupIndex =
				event.key === "ArrowRight"
					? (groupIndex + 1) % groups.length
					: (groupIndex - 1 + groups.length) % groups.length;

			const nextGroup = groups[nextGroupIndex];
			const firstLink = nextGroup?.querySelector<HTMLAnchorElement>("a");
			firstLink?.focus();
		}
	};

	return (
		<footer className="bottomFooter" role="contentinfo">
			<nav
				className="bottomFooter__nav"
				aria-label={language === "fr" ? "Pied de page" : "Footer navigation"}>
				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.resources.title}</h2>
					<div className="bottomFooter__group-links">
						<Link
							href="/rss.xml"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link"
							id="rss-link"
							onKeyDown={handleKeyDown}>
							<FaRss aria-hidden="true" />
							<span>{t.resources.rss}</span>
						</Link>
						<Link
							href="https://www.linkedin.com/in/simon-lm-86b71235b"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link"
							onKeyDown={handleKeyDown}>
							<FaLinkedin aria-hidden="true" />
							<span>LinkedIn</span>
						</Link>
						<Link
							href="https://x.com/SimonLM_Dev"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link"
							onKeyDown={handleKeyDown}>
							<FaXTwitter aria-hidden="true" />
							<span>X (Twitter)</span>
						</Link>
						<Link
							href="https://www.youtube.com/@LostInTab"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link"
							onKeyDown={handleKeyDown}>
							<FaYoutube aria-hidden="true" />
							<span>YouTube</span>
						</Link>
						<Link
							href="https://github.com/Simon-LM"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link"
							onKeyDown={handleKeyDown}>
							<FaGithub aria-hidden="true" />
							<span>GitHub</span>
						</Link>
					</div>
				</div>
				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.navigation.title}</h2>
					<Link
						href={`/${language}/#main-content`}
						// onClick={(e) => handleNavigation("main-content")(e)}
						onClick={() => handleNavClick("main-content")}
						onKeyDown={handleKeyDown}>
						{t.navigation.home}
					</Link>
					<Link
						href={`/${language}/#about`}
						// onClick={(e) => handleNavigation("about")(e)}
						onClick={() => handleNavClick("about")}
						onKeyDown={handleKeyDown}>
						{t.navigation.why}
					</Link>
					<Link
						href={`/${language}/#skills`}
						// onClick={(e) => handleNavigation("skills")(e)}
						onClick={() => handleNavClick("skills")}
						onKeyDown={handleKeyDown}>
						{t.navigation.skills}
					</Link>
					<Link
						href={`/${language}/#portfolio`}
						// onClick={(e) => handleNavigation("portfolio")(e)}
						onClick={() => handleNavClick("portfolio")}
						onKeyDown={handleKeyDown}>
						{t.navigation.portfolio}
					</Link>
					<Link
						href={`/${language}/#contact`}
						// onClick={(e) => handleNavigation("contact")(e)}
						onClick={() => handleNavClick("contact")}
						onKeyDown={handleKeyDown}>
						{t.navigation.contact}
					</Link>
				</div>
				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.legal.title}</h2>

					<Link href={`/${language}/sitemap`} onKeyDown={handleKeyDown}>
						{t.legal.sitemap}
					</Link>
					<Link href={`/${language}/legal`} onKeyDown={handleKeyDown}>
						{t.legal.mentions}
					</Link>
					<Link
						href={`/${language}/terms`}
						onKeyDown={handleKeyDown}
						title={
							language === "fr"
								? "Conditions Générales d’Utilisation"
								: "Terms of Service"
						}>
						{t.legal.terms}
					</Link>
					<Link href={`/${language}/privacy-policy`} onKeyDown={handleKeyDown}>
						{t.legal.privacy}
					</Link>
					<Link href={`/${language}/accessibility`} onKeyDown={handleKeyDown}>
						{t.legal.accessibility}
					</Link>
				</div>
			</nav>
		</footer>
	);
}
