/** @format */

"use client";

import { useEffect, useRef, useState } from "react";
import { RiMenu3Line } from "react-icons/ri";
import { useLanguageStore } from "../../store/langueStore";
import Link from "next/link";
import LanguageSelector from "../languageSelector/LanguageSelector";
import { useScrollNavigation } from "../../hooks/useScrollNavigation";
import { useCursorNavigation } from "../../hooks/useCursorNavigation";

export default function NavigationSticky() {
	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { language } = useLanguageStore();
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const isCursorNavigationEnabled = useCursorNavigation();

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

	useEffect(() => {
		const handleFocusOut = (event: FocusEvent) => {
			if (
				isMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(event.relatedTarget as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		const menuElement = menuRef.current;
		menuElement?.addEventListener("focusout", handleFocusOut);

		return () => {
			menuElement?.removeEventListener("focusout", handleFocusOut);
		};
	}, [isMenuOpen]);

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

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isMenuOpen) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isMenuOpen]);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (isCursorNavigationEnabled) {
			return;
		}

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			// Sélectionner tous les éléments interactifs du menu
			const menuItems = document.querySelectorAll(
				'[role="menuitem"]:not([disabled])'
			);
			const currentIndex = Array.from(menuItems).indexOf(
				event.target as HTMLElement
			);
			const nextIndex =
				event.key === "ArrowDown"
					? (currentIndex + 1) % menuItems.length
					: (currentIndex - 1 + menuItems.length) % menuItems.length;
			(menuItems[nextIndex] as HTMLElement).focus();
		}
	};

	const handleNavClick = () => {
		setIsMenuOpen(false);
	};

	const { handleNavigation } = useScrollNavigation();

	return (
		<nav
			id="navigation-menu"
			className={`navigation-sticky ${
				isHeaderVisible || isHovered ? "show-text" : ""
			} ${isMenuOpen ? "menu-open" : ""}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="navigation"
			// aria-label={t.menu}
		>
			<button
				ref={buttonRef}
				className="menu-button"
				aria-label={isMenuOpen ? t.closeMenu : t.menu}
				aria-expanded={isMenuOpen}
				aria-controls="menu-list"
				aria-haspopup="true"
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				onKeyDown={handleKeyDown}>
				<RiMenu3Line />
				<span className="menu-text" aria-hidden="true">
					{t.menu}
				</span>
			</button>

			{isMenuOpen && (
				<div ref={menuRef} className="navigation-menu">
					<LanguageSelector onKeyDown={handleKeyDown} />

					<ul id="menu-list" role="menu">
						<li role="none">
							<Link
								className="nav-link skip-link"
								role="menuitem"
								href={`/${language}/sitemap`}
								onClick={handleNavClick}
								onKeyDown={handleKeyDown}>
								{t.sitemap}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#main-content`}
								onClick={(e) => {
									handleNavigation("main-content")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.home}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#about`}
								onClick={(e) => {
									handleNavigation("about")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.why}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#skills`}
								onClick={(e) => {
									handleNavigation("skills")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.skills}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#portfolio`}
								onClick={(e) => {
									handleNavigation("portfolio")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.portfolio}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#contact`}
								onClick={(e) => {
									handleNavigation("contact")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.contact}
							</Link>
						</li>

						<li role="none">
							<Link
								className="nav-link"
								role="menuitem"
								href={`/${language}/#rss-link`}
								onClick={(e) => {
									handleNavigation("rss-link")(e);
									handleNavClick();
								}}
								onKeyDown={handleKeyDown}>
								{t.social}
							</Link>
						</li>
					</ul>
				</div>
			)}
		</nav>
	);
}
