/** @format */

// "use client";

// import { useEffect, useState } from "react";
// import { RiMenu3Line } from "react-icons/ri";

// export default function NavigationSticky() {
// 	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
// 	const [isHovered, setIsHovered] = useState(false);

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
// 			setIsHeaderVisible(window.scrollY < headerHeight);
// 		};

// 		window.addEventListener("scroll", handleScroll);
// 		return () => window.removeEventListener("scroll", handleScroll);
// 	}, []);

// 	return (
// 		<div
// 			className={`navigation-sticky ${
// 				isHeaderVisible || isHovered ? "show-text" : ""
// 			}`}
// 			onMouseEnter={() => setIsHovered(true)}
// 			onMouseLeave={() => setIsHovered(false)}>
// 			<button className="menu-button" aria-label="Menu principal">
// 				<RiMenu3Line />
// 				<span className="menu-text">Menu</span>
// 			</button>
// 		</div>
// 	);
// }

// // // // // // // // //

// import { useEffect, useState, useRef } from "react";
// import { RiMenu3Line } from "react-icons/ri";
// import { useLanguageStore } from "../../store/langueStore";
// import Link from "next/link";
// import LanguageSelector from "../languageSelector/LanguageSelector";

// export default function NavigationSticky() {
// 	const [isHeaderVisible, setIsHeaderVisible] = useState(true);
// 	const [isHovered, setIsHovered] = useState(false);
// 	const [isMenuOpen, setIsMenuOpen] = useState(false);
// 	const { language } = useLanguageStore();
// 	const menuRef = useRef<HTMLDivElement>(null);
// 	const buttonRef = useRef<HTMLButtonElement>(null);

// 	const translations = {
// 		fr: {
// 			skipLink: "Contenu",
// 			home: "Accueil",
// 			why: "Pourquoi l'accessibilité",
// 			skills: "Compétences",
// 			portfolio: "Portfolio",
// 			contact: "Contact",
// 			social: "Réseaux sociaux",
// 			menu: "Menu",
// 			closeMenu: "Fermer le menu",
// 		},
// 		en: {
// 			skipLink: "Content",
// 			home: "Home",
// 			why: "Why Accessibility",
// 			skills: "Skills",
// 			portfolio: "Portfolio",
// 			contact: "Contact",
// 			social: "Social Networks",
// 			menu: "Menu",
// 			closeMenu: "Close menu",
// 		},
// 	};

// 	const t = translations[language];

// 	// useEffect(() => {
// 	// 	const handleScroll = () => {
// 	// 		const headerHeight = document.querySelector("header")?.offsetHeight || 0;
// 	// 		setIsHeaderVisible(window.scrollY < headerHeight);
// 	// 	};

// 	// 	window.addEventListener("scroll", handleScroll);
// 	// 	return () => window.removeEventListener("scroll", handleScroll);
// 	// }, []);

// 	useEffect(() => {
// 		const handleClickOutside = (event: MouseEvent) => {
// 			if (
// 				menuRef.current &&
// 				buttonRef.current &&
// 				!menuRef.current.contains(event.target as Node) &&
// 				!buttonRef.current.contains(event.target as Node)
// 			) {
// 				setIsMenuOpen(false);
// 			}
// 		};
// 		document.addEventListener("mousedown", handleClickOutside);
// 		return () => document.removeEventListener("mousedown", handleClickOutside);
// 	}, []);

// 	// const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
// 	// 	e.preventDefault();
// 	// 	setIsMenuOpen(false);
// 	// 	document.getElementById(id)?.scrollIntoView({
// 	// 		behavior: "smooth",
// 	// 	});
// 	// };

// 	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
// 		e.preventDefault();
// 		setIsMenuOpen(false);

// 		const element = document.getElementById(id);
// 		element?.scrollIntoView({
// 			behavior: "smooth",
// 		});

// 		// Si c'est le lien réseaux sociaux, focus sur le premier lien RSS
// 		if (id === "bottomFooter") {
// 			setTimeout(() => {
// 				document.getElementById("rss-link")?.focus();
// 			}, 800); // Attendre la fin du scroll
// 		} else if (id === "hero-section") {
// 			setTimeout(() => {
// 				// Focus sur le titre pour meilleure accessibilité
// 				document.getElementById("hero-title")?.focus();
// 				// Alternative : focus sur le premier collapse
// 				// document.getElementById("hero-collapse-0")?.focus();
// 			}, 800);
// 		}
// 	};

// 	return (
// 		<nav
// 			className={`navigation-sticky ${
// 				isHeaderVisible || isHovered ? "show-text" : ""
// 			} ${isMenuOpen ? "menu-open" : ""}`}
// 			onMouseEnter={() => setIsHovered(true)}
// 			onMouseLeave={() => setIsHovered(false)}>
// 			<button
// 				className="menu-button"
// 				aria-label={isMenuOpen ? t.closeMenu : t.menu}
// 				aria-expanded={isMenuOpen}
// 				onClick={() => setIsMenuOpen(!isMenuOpen)}>
// 				<RiMenu3Line />
// 				<span className="menu-text">{t.menu}</span>
// 			</button>

// 			{isMenuOpen && (
// 				<div className="navigation-menu">
// 					<Link
// 						href="#hero-section"
// 						onClick={(e) => handleClick(e, "hero-section")}
// 						className="skip-link">
// 						{t.skipLink}
// 					</Link>

// 					<LanguageSelector />

// 					<Link href={`/${language}`}>{t.home}</Link>
// 					<Link
// 						href={`/${language}/#about`}
// 						onClick={(e) => handleClick(e, "about")}>
// 						{t.why}
// 					</Link>
// 					<Link
// 						href={`/${language}/#skills`}
// 						onClick={(e) => handleClick(e, "skills")}>
// 						{t.skills}
// 					</Link>
// 					<Link
// 						href={`/${language}/#portfolio`}
// 						onClick={(e) => handleClick(e, "portfolio")}>
// 						{t.portfolio}
// 					</Link>
// 					<Link
// 						href={`/${language}/#contact`}
// 						onClick={(e) => handleClick(e, "contact")}>
// 						{t.contact}
// 					</Link>
// 					<Link
// 						href={`/${language}/#bottomFooter`}
// 						onClick={(e) => handleClick(e, "bottomFooter")}>
// 						{t.social}
// 					</Link>
// 				</div>
// 			)}
// 		</nav>
// 	);
// }

// // // // // // // // // // // // // // // // // // // // // // // //

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

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		setIsMenuOpen(false);

		const element = document.getElementById(id);
		element?.scrollIntoView({
			behavior: "smooth",
		});

		if (id === "bottomFooter") {
			setTimeout(() => {
				document.getElementById("rss-link")?.focus();
			}, 800);
		} else if (id === "hero-section") {
			setTimeout(() => {
				document.getElementById("hero-title")?.focus();
			}, 800);
		}
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
						href="#hero-section"
						onClick={(e) => handleClick(e, "hero-section")}
						className="skip-link">
						{t.skipLink}
					</Link>

					<LanguageSelector />

					<Link href={`/${language}`} onClick={() => setIsMenuOpen(false)}>
						{t.home}
					</Link>

					<Link
						href={`/${language}/#about`}
						onClick={(e) => handleClick(e, "about")}>
						{t.why}
					</Link>

					<Link
						href={`/${language}/#skills`}
						onClick={(e) => handleClick(e, "skills")}>
						{t.skills}
					</Link>

					<Link
						href={`/${language}/#portfolio`}
						onClick={(e) => handleClick(e, "portfolio")}>
						{t.portfolio}
					</Link>

					<Link
						href={`/${language}/#contact`}
						onClick={(e) => handleClick(e, "contact")}>
						{t.contact}
					</Link>

					<Link
						href={`/${language}/#bottomFooter`}
						onClick={(e) => handleClick(e, "bottomFooter")}>
						{t.social}
					</Link>
				</div>
			)}
		</nav>
	);
}
