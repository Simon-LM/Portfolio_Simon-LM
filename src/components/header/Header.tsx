/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../hooks/useLanguage";

export default function Header() {
	// Comment in English: Hook to switch language
	const { currentLang, switchLanguage } = useLanguage();

	return (
		<header className="header">
			<h1>
				<Link href={`/${currentLang}`}>
					{currentLang === "fr"
						? "Simon LM | Spécialiste en Accessibilité Web"
						: "Simon LM | Web Accessibility Specialist"}
				</Link>
			</h1>
			<nav>
				<button
					onClick={() => switchLanguage("en")}
					aria-pressed={currentLang === "en"}
					disabled={currentLang === "en"}
					aria-label="Switch to English">
					EN
				</button>
				<button
					onClick={() => switchLanguage("fr")}
					aria-pressed={currentLang === "fr"}
					disabled={currentLang === "fr"}
					aria-label="Passer au français">
					FR
				</button>
				<button aria-label={currentLang === "fr" ? "Menu" : "Menu"}>
					Menu
				</button>

				<Link
					href={`/${currentLang}/blog`}
					aria-label={
						currentLang === "fr" ? "Blog LostInTab" : "Blog LostInTab"
					}>
					Blog LostInTab
				</Link>
			</nav>
		</header>
	);
}
