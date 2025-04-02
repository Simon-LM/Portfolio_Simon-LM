/** @format */

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguageStore } from "../../store/langueStore";
import { useRouter } from "next/navigation";
import {
	shouldUpdateDictionary,
	DICTIONARY_VERSION,
} from "../../utils/dictionaryVersion";

import AccessibilityControl from "../../accessibility/accessibilityControl/AccessibilityControl";

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
	// const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false); // Nouvel état
	// const menuRef = useRef<HTMLDivElement>(null); // Pour détecter les clics à l'extérieur

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (shouldUpdateDictionary(version)) {
			setVersion(DICTIONARY_VERSION);
			router.refresh();
		}
	}, [version, setVersion, router]);

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
					{/* <AccessibilityControl
						language={language as "fr" | "en"}
						className="header__accessibility"
					/> */}

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

					{/* Conteneur du menu d'accessibilité */}
					<AccessibilityControl
						language={language as "fr" | "en"}
						className="header__accessibility"
					/>
				</div>

				<div className="header__nav-main">
					<div className="header__title">
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
					</div>

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
							loading="eager"
							priority
						/>
						{dictionary.header.blog}
					</Link>
				</div>
			</div>
		</header>
	);
}
