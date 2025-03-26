/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useLanguageStore } from "../../store/langueStore";
import { useRouter } from "next/navigation";
import {
	shouldUpdateDictionary,
	DICTIONARY_VERSION,
} from "../../utils/dictionaryVersion";
// import ThemeToggleButton from "../themeToggleButton/ThemeToggleButton";
import AccessibilityMenu from "../themeToggleButton/ThemeToggleButton";

import accessibilityIconWebp from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.webp";
import accessibilityIconAvif from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.avif";
import accessibilityIconPng from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.png";
import LogoLostInTab from "../../../public/Logo_LostInTab/LOGO_LostInTab_circle_60-60_2024.png";

// Types and Interfaces
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
	const { language, setLanguage, version, setVersion } = useLanguageStore();
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false); // Nouvel état
	const menuRef = useRef<HTMLDivElement>(null); // Pour détecter les clics à l'extérieur

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (shouldUpdateDictionary(version)) {
			setVersion(DICTIONARY_VERSION);
			router.refresh();
		}
	}, [version, setVersion, router]);

	// // // // //

	// Fermer le menu quand on clique ailleurs
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setAccessibilityMenuOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuRef]);

	const toggleAccessibilityMenu = () => {
		setAccessibilityMenuOpen(!accessibilityMenuOpen);
	};

	// // // // // // // // // //

	const switchLanguage = (newLang: "fr" | "en") => {
		setLanguage(newLang);
		const currentPath = window.location.pathname.split("/").slice(2).join("/");
		router.push(`/${newLang}/${currentPath}`);
	};

	// Initial render before hydration
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
	// Render after hydration
	return (
		<header className="header">
			<div>
				<a href="#main-content" className="header__skip">
					{language === "fr"
						? "Aller au contenu principal"
						: "Skip to main content"}
				</a>
				<div className="header__utils">
					{/* Conteneur du menu d'accessibilité */}
					<div className="header__accessibility-menu" ref={menuRef}>
						<button
							className="header__accessibility-button"
							onClick={toggleAccessibilityMenu}
							aria-expanded={accessibilityMenuOpen}
							aria-label={
								language === "fr"
									? "Options d'accessibilité"
									: "Accessibility options"
							}>
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
						</button>

						{/* Panneau des options d'accessibilité */}
						<div
							className={`accessibility-panel ${
								accessibilityMenuOpen ? "open" : ""
							}`}>
							{/* <ThemeToggleButton language={language} /> */}
							<AccessibilityMenu language={language} />
						</div>
					</div>

					{/* <picture className="header__accessibility-icon">
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

					<ThemeToggleButton language={language} /> */}

					<div className="header__lang">
						<div className="header__lang-toggle">
							<button
								onClick={() => switchLanguage("en")}
								className="header__lang-button"
								disabled={language === "en"}
								aria-label="Switch to English"
								data-tooltip="Switch to English"
								aria-current={language === "en" ? "true" : undefined}
								// aria-label={`Switch to English${
								// language === "en" ? " Anglais actif" : " inactive"
								// }`}
							>
								EN
							</button>
							<button
								onClick={() => switchLanguage("fr")}
								className="header__lang-button"
								disabled={language === "fr"}
								aria-label="Passer au français"
								data-tooltip="Passer au français"
								aria-current={language === "fr" ? "true" : undefined}
								// aria-label={`Passer au français${
								// language === "fr" ? " French active" : " inactif"
								// }`}
							>
								FR
							</button>
						</div>
					</div>
				</div>

				<div className="header__nav-main">
					<div className="header__title">
						{/* <Link href={`/${language}`}> */}
						<span>
							<span className="header__title-name">
								{dictionary.header.title.name}
							</span>
							<span className="header__title-separator" aria-hidden="true">
								{" "}
								|{" "}
							</span>
							<span className="header__title-role">
								{dictionary.header.title.role}
							</span>
						</span>
						{/* </Link> */}
					</div>
					{/* <Link
						href={`/${language}/blog`}
						className="header__blog-link"
						aria-label="Blog LostInTab">
						{dictionary.header.blog}
					</Link> */}

					<Link
						href="https://www.youtube.com/@LostInTab"
						className="header__blog-link"
						target="_blank"
						rel="noopener noreferrer"
						data-tooltip={
							language === "fr"
								? "Visiter la chaîne Youtube"
								: "Visit the Youtube channel"
						}
						aria-label={
							language === "fr"
								? "Visiter la chaîne Youtube de LostInTab"
								: "Visit the Youtube channel of LostInTab"
						}>
						<Image
							src={LogoLostInTab}
							alt="Logo LostInTab"
							width={60}
							height={60}
							className="header__blog-logo"
							aria-hidden="true"
						/>
						{dictionary.header.blog}
					</Link>
				</div>
			</div>
		</header>
	);
}
