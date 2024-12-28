/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../hooks/useLanguage";
import { RiMenu3Line, RiNotification3Line } from "react-icons/ri";
import { FaBlog, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function StickyFooter() {
	const { currentLang } = useLanguage();

	return (
		<footer className="stickyFooter">
			<nav>
				<Link href="#menu" aria-label={currentLang === "fr" ? "Menu" : "Menu"}>
					<RiMenu3Line />
				</Link>
				<Link href={`/${currentLang}/blog`} aria-label="Blog LostInTab">
					<FaBlog />
				</Link>
				<button
					aria-label={currentLang === "fr" ? "Notifications" : "Notifications"}>
					<RiNotification3Line />
				</button>
				<Link
					href="https://www.linkedin.com/"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="LinkedIn">
					<FaLinkedin />
				</Link>
				<Link
					href="#contact"
					aria-label={currentLang === "fr" ? "Contact" : "Contact"}>
					<MdEmail />
				</Link>
			</nav>
		</footer>
	);
}
