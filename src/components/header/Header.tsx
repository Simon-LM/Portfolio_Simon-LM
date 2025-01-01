/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../hooks/useLanguage";
import { useEffect, useState } from "react";
import accessibilityIconWebp from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.webp";
import accessibilityIconAvif from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.avif";
import accessibilityIconPng from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.png";
// import eiffelTowerWebp from "../../../public/icons/icons_FR-EN/Icon_Eiffel-tower/Icon_Eiffel-tower.webp";
// import eiffelTowerAvif from "../../../public/icons/icons_FR-EN/Icon_Eiffel-tower/Icon_Eiffel-tower.avif";
// import eiffelTowerPng from "../../../public/icons/icons_FR-EN/Icon_Eiffel-tower/Icon_Eiffel-tower.png";
// import phoneBoxWebp from "../../../public/icons/icons_FR-EN/Red_telephone_box/Icon_red-telephone-boxe.webp";
// import phoneBoxAvif from "../../../public/icons/icons_FR-EN/Red_telephone_box/Icon_red-telephone-boxe.avif";
// import phoneBoxPng from "../../../public/icons/icons_FR-EN/Red_telephone_box/Icon_red-telephone-boxe.png";

interface HeaderProps {
	dictionary: {
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
	};
}

export default function Header({ dictionary }: HeaderProps) {
	const { currentLang, switchLanguage } = useLanguage();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Rendu initial sans attribut lang
	if (!mounted) {
		return (
			<header className="header">
				<nav>
					<div className="header__utils">
						<div className="header__accessibility-icon skeleton" />
					</div>
				</nav>
			</header>
		);
	}

	// Rendu après hydratation
	return (
		<header className="header">
			<nav>
				<div className="header__utils">
					<picture className="header__accessibility-icon">
						<source srcSet={accessibilityIconAvif.src} type="image/avif" />
						<source srcSet={accessibilityIconWebp.src} type="image/webp" />
						<Image
							src={accessibilityIconPng}
							alt={dictionary.header.accessibilityIcon.alt || ""}
							title={dictionary.header.accessibilityIcon.title || ""}
							width={24}
							height={24}
							loading="eager"
							priority
						/>
					</picture>
					<div className="header__lang">
						{/* <picture className="header__lang-icon">
							<source srcSet={phoneBoxAvif.src} type="image/avif" />
							<source srcSet={phoneBoxWebp.src} type="image/webp" />
							<Image src={phoneBoxPng} alt="" width={16} height={16} priority />
						</picture> */}
						<div className="header__lang-toggle">
							<button
								onClick={() => switchLanguage("en")}
								className="header__lang-button"
								aria-pressed={currentLang === "en"}
								disabled={currentLang === "en"}
								aria-label="Switch to English">
								EN
							</button>
							<button
								onClick={() => switchLanguage("fr")}
								className="header__lang-button"
								aria-pressed={currentLang === "fr"}
								disabled={currentLang === "fr"}
								aria-label="Passer au français">
								FR
							</button>
						</div>
						{/* <picture className="header__lang-icon">
							<source srcSet={eiffelTowerAvif.src} type="image/avif" />
							<source srcSet={eiffelTowerWebp.src} type="image/webp" />
							<Image
								src={eiffelTowerPng}
								alt=""
								width={16}
								height={16}
								priority
							/>
						</picture> */}
					</div>
				</div>
				<div className="header__nav-main">
					<h1 className="header__title">
						<Link href={`/${currentLang}`}>
							<span className="header__title-name">
								{dictionary.header.title.name}
							</span>
							<span className="header__title-separator"> | </span>
							<span className="header__title-role">
								{dictionary.header.title.role}
							</span>
						</Link>
					</h1>
					<Link
						href={`/${currentLang}/blog`}
						className="header__blog-link"
						aria-label="Blog LostInTab">
						Blog LostInTab
					</Link>
				</div>
			</nav>
		</header>
	);
}
