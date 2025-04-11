/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useLanguageStore } from "../../store/langueStore";
// import {  RiNotification3Line } from "react-icons/ri";
import { FaLinkedin, FaXTwitter, FaYoutube, FaGithub } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaUniversalAccess } from "react-icons/fa";

export default function StickyFooter() {
	const { language } = useLanguageStore();
	// const { currentLang } = useLanguage();
	// const accessibilityText =
	// 	currentLang === "fr"
	// 		? "Accessibilité : déclaration de conformité"
	// 		: "Accessibility: compliance statement";

	const accessibilityText =
		language === "fr"
			? "Accessibilité : déclaration de conformité"
			: "Accessibility: compliance statement";

	return (
		<footer
			className="sticky-footer"
			role="contentinfo"
			aria-label={language === "fr" ? "Liens rapides" : "Quick links"}>
			<nav className="sticky-footer__nav">
				{/* <Link
					href="/accessibility"
					className="sticky-footer__accessibility"
					aria-label={accessibilityText}>
					<FaUniversalAccess className="sticky-footer__accessibility-icon" />
					<span className="sticky-footer__accessibility-text">
						{accessibilityText}
					</span>
				</Link> */}

				<Link
					href={`/${language}/accessibility`}
					className="sticky-footer__accessibility"
					aria-label={accessibilityText}>
					<FaUniversalAccess className="sticky-footer__accessibility-icon" />
					<span className="sticky-footer__accessibility-text">
						{accessibilityText}
					</span>
				</Link>

				<div className="sticky-footer__social">
					<Link
						href="https://x.com/SimonLM_Dev"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Twitter"
						data-tooltip="Twitter">
						<FaXTwitter
							className="sticky-footer__icon"
							role="img"
							aria-label="Twitter"
						/>
					</Link>
					<Link
						href="https://www.youtube.com/@LostInTab"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="YouTube"
						data-tooltip="YouTube">
						<FaYoutube
							className="sticky-footer__icon"
							role="img"
							aria-label="Youtube"
						/>
					</Link>
					<Link
						href="https://github.com/Simon-LM"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub"
						data-tooltip="GitHub">
						<FaGithub
							className="sticky-footer__icon"
							role="img"
							aria-label="GitHub"
						/>
					</Link>
				</div>
				<div className="sticky-footer__fixed-links">
					<Link
						href="https://www.linkedin.com/in/simon-lm-86b71235b"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="LinkedIn"
						data-tooltip="LinkedIn">
						<FaLinkedin
							className="sticky-footer__icon"
							role="img"
							aria-label="LinkedIn"
						/>
					</Link>
					<Link
						href={`/${language}/#contact`}
						className="sticky-footer__link"
						aria-label="Contact"
						data-tooltip="Contact">
						<MdEmail
							className="sticky-footer__icon"
							role="img"
							aria-label="Contact"
						/>
					</Link>
				</div>
			</nav>
		</footer>
	);
}
