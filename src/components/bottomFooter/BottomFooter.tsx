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

export default function BottomFooter() {
	const { language } = useLanguageStore();

	const translations = {
		fr: {
			legal: {
				title: "Informations légales",
				mentions: "Mentions légales",
				terms: "CGU",
				privacy: "Politique de confidentialité",
				accessibility: "Accessibilité",
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
				mentions: "Legal Notice",
				terms: "Terms",
				privacy: "Privacy Policy",
				accessibility: "Accessibility",
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

	return (
		<footer className="bottomFooter" role="contentinfo">
			<nav
				className="bottomFooter__nav"
				aria-label={language === "fr" ? "Pied de page" : "Footer navigation"}>
				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.legal.title}</h2>

					<Link href={`/${language}/legal`}>{t.legal.mentions}</Link>
					<Link href={`/${language}/terms`}>{t.legal.terms}</Link>
					<Link href={`/${language}/privacy-policy`}>{t.legal.privacy}</Link>
					<Link href={`/${language}/accessibility`}>
						{t.legal.accessibility}
					</Link>
				</div>

				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.navigation.title}</h2>
					<Link href={`/${language}`}>{t.navigation.home}</Link>
					<Link href={`/${language}/#about`}>{t.navigation.why}</Link>
					<Link href={`/${language}/#skills`}>{t.navigation.skills}</Link>
					<Link href={`/${language}/#portfolio`}>{t.navigation.portfolio}</Link>
					<Link href={`/${language}/#contact`}>{t.navigation.contact}</Link>
				</div>

				<div className="bottomFooter__group">
					<h2 className="bottomFooter__title">{t.resources.title}</h2>
					<div className="bottomFooter__group-links">
						<Link
							href="/rss.xml"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link">
							<FaRss aria-hidden="true" />
							<span>{t.resources.rss}</span>
						</Link>
						<Link
							href="https://www.linkedin.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link">
							<FaLinkedin aria-hidden="true" />
							<span>LinkedIn</span>
						</Link>
						<Link
							href="https://x.com/SimonLM_Dev"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link">
							<FaXTwitter aria-hidden="true" />
							<span>X (Twitter)</span>
						</Link>
						<Link
							href="https://www.youtube.com/@LostInTab"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link">
							<FaYoutube aria-hidden="true" />
							<span>YouTube</span>
						</Link>
						<Link
							href="https://github.com/Simon-LM"
							target="_blank"
							rel="noopener noreferrer"
							className="bottomFooter__social-link">
							<FaGithub aria-hidden="true" />
							<span>GitHub</span>
						</Link>
					</div>
				</div>
			</nav>
		</footer>
	);
}
