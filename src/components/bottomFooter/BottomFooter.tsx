/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../hooks/useLanguage";

export default function BottomFooter() {
	const { currentLang } = useLanguage();

	return (
		<footer className="bottomFooter">
			<nav>
				<Link href="/rss.xml" target="_blank" aria-label="RSS Feed">
					RSS
				</Link>
				<Link
					href={`/${currentLang}/legal`}
					aria-label={
						currentLang === "fr" ? "Mentions légales" : "Legal notice"
					}>
					{currentLang === "fr" ? "Mentions légales" : "Legal notice"}
				</Link>
				<Link
					href={`/${currentLang}/sitemap`}
					aria-label={currentLang === "fr" ? "Plan du site" : "Sitemap"}>
					{currentLang === "fr" ? "Plan du site" : "Sitemap"}
				</Link>
			</nav>
		</footer>
	);
}
