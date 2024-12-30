/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../hooks/useLanguage";
// import {  RiNotification3Line } from "react-icons/ri";
import { FaLinkedin, FaTwitter, FaYoutube, FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaUniversalAccess } from "react-icons/fa";

export default function StickyFooter() {
	const { currentLang } = useLanguage();
	const accessibilityText =
		currentLang === "fr"
			? "Accessibilité : déclaration de conformité"
			: "Accessibility: compliance statement";

	return (
		<footer className="sticky-footer">
			<nav className="sticky-footer__nav">
				<Link
					href="/accessibility"
					className="sticky-footer__accessibility"
					aria-label={accessibilityText}>
					<FaUniversalAccess className="sticky-footer__link" />
					<span className="sticky-footer__accessibility-text">
						{accessibilityText}
					</span>
				</Link>
				<div className="sticky-footer__social">
					<Link
						href="https://twitter.com/"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Twitter">
						<FaTwitter />
					</Link>
					<Link
						href="https://youtube.com/"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="YouTube">
						<FaYoutube />
					</Link>
					<Link
						href="https://github.com/"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub">
						<FaGithub />
					</Link>
				</div>
				<div className="sticky-footer__fixed-links">
					<Link
						href="https://www.linkedin.com/"
						className="sticky-footer__link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="LinkedIn">
						<FaLinkedin />
					</Link>
					<Link
						href="#contact"
						className="sticky-footer__link"
						aria-label={currentLang === "fr" ? "Contact" : "Contact"}>
						<MdEmail />
					</Link>
				</div>
			</nav>
		</footer>
	);
}
