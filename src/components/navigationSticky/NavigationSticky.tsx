/** @format */

"use client";

import { useEffect, useRef, useState } from "react";
import { RiMenu3Line } from "react-icons/ri";
import { useLanguageStore } from "../../store/langueStore";
import Link from "next/link";
import LanguageSelector from "../languageSelector/LanguageSelector";

// interface NavigationStickyProps {
// 	t: {
// 		skipLink: string;
// 		home: string;
// 		why: string;
// 		skills: string;
// 		portfolio: string;
// 		contact: string;
// 		social: string;
// 		menu: string;
// 		closeMenu: string;
// 	};
// }

export default function NavigationSticky() {
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { language } = useLanguageStore();
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const translations = {
		fr: {
			skipLink: "Contenu",
			sitemap: "Plan du site",
			home: "Accueil",
			why: "Pourquoi l'accessibilité",
			skills: "Compétences",
			portfolio: "Portfolio",
			contact: "Contact",
			social: "Réseaux sociaux",
			menu: "Menu",
			closeMenu: "Fermer le menu",
		},
		en: {
			skipLink: "Content",
			sitemap: "Site Map",
			home: "Home",
			why: "Why Accessibility",
			skills: "Skills",
			portfolio: "Portfolio",
			contact: "Contact",
			social: "Social Networks",
			menu: "Menu",
			closeMenu: "Close menu",
		},
	};

	const t = translations[language as keyof typeof translations];

	useEffect(() => {
		const handleScroll = () => {
			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
			setIsHeaderVisible(window.scrollY < headerHeight);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				buttonRef.current &&
				!menuRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleNavClick = () => {
		setIsMenuOpen(false);
	};

	return (
		<nav
			className={`navigation-sticky ${
				isHeaderVisible || isHovered ? "show-text" : ""
			} ${isMenuOpen ? "menu-open" : ""}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			<button
				ref={buttonRef}
				className="menu-button"
				aria-label={isMenuOpen ? t.closeMenu : t.menu}
				aria-expanded={isMenuOpen}
				onClick={() => setIsMenuOpen(!isMenuOpen)}>
				<RiMenu3Line />
				<span className="menu-text">{t.menu}</span>
			</button>

			{isMenuOpen && (
				<div ref={menuRef} className="navigation-menu">
					<Link
						href={`/${language}/sitemap`}
						onClick={handleNavClick}
						className="skip-link">
						{t.sitemap}
					</Link>

					<LanguageSelector />

					<Link href={`/${language}/#main-content`} onClick={handleNavClick}>
						{t.home}
					</Link>

					<Link href={`/${language}/#about`} onClick={handleNavClick}>
						{t.why}
					</Link>

					<Link href={`/${language}/#skills`} onClick={handleNavClick}>
						{t.skills}
					</Link>

					<Link href={`/${language}/#portfolio`} onClick={handleNavClick}>
						{t.portfolio}
					</Link>

					<Link href={`/${language}/#contact`} onClick={handleNavClick}>
						{t.contact}
					</Link>

					<Link href={`/${language}/#bottomFooter`} onClick={handleNavClick}>
						{t.social}
					</Link>
				</div>
			)}
		</nav>
	);
}
