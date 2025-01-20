/** @format */

"use client";

import React, { ReactNode } from "react";
// import { motion } from "framer-motion";
// import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { useLanguage } from "../../hooks/useLanguage";

interface Section {
	id: string;
	name: ReactNode; // Au lieu de JSX.Element
	ariaLabel: {
		fr: string;
		en: string;
	};
}

const sections: Section[] = [
	{
		id: "hero",
		name: <BsChevronUp size={16} className="scroll-progress__arrows" />,
		ariaLabel: {
			fr: "Retourner en haut de la page",
			en: "Back to top",
		},
	},
	{
		id: "about",
		name: "Why?",
		ariaLabel: {
			fr: "Aller à la section Pourquoi ?",
			en: "Go to Why section",
		},
	},
	{
		id: "skills",
		name: "Skills",
		ariaLabel: {
			fr: "Aller à la section compétences",
			en: "Go to Skills section",
		},
	},
	{
		id: "portfolio",
		name: "Portfolio",
		ariaLabel: {
			fr: "Aller à la section portfolio",
			en: "Go to Portfolio section",
		},
	},
	{
		id: "contact",
		name: "Contact",
		ariaLabel: {
			fr: "Aller à la section contact",
			en: "Go to Contact section",
		},
	},
	{
		id: "bottomFooter",
		name: <BsChevronDown size={16} className="scroll-progress__arrows" />,
		ariaLabel: {
			fr: "Aller en bas de la page",
			en: "Go to bottom of page",
		},
	},
];

export default function ScrollProgressBar() {
	const { currentLang } = useLanguage();
	const [activeSection, setActiveSection] = useState<string>("hero");
	// const { scrollYProgress } = useScroll();

	useEffect(() => {
		const handleScroll = () => {
			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
			const scrollPosition = window.scrollY + window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			// Check if at bottom
			if (scrollPosition >= documentHeight - 100) {
				setActiveSection(sections[sections.length - 1].id);
				return;
			}

			// Check if at top
			if (window.scrollY <= headerHeight) {
				setActiveSection("hero");
				return;
			}

			// Check other sections
			sections.forEach((section) => {
				const element = document.getElementById(section.id);
				if (element) {
					const rect = element.getBoundingClientRect();
					if (
						rect.top <= window.innerHeight / 2 &&
						rect.bottom >= window.innerHeight / 2
					) {
						setActiveSection(section.id);
					}
				}
			});
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		sectionId: string
	) => {
		e.preventDefault();
		if (sectionId === "hero") {
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else if (sectionId === "bottomFooter") {
			window.scrollTo({
				top: document.documentElement.scrollHeight,
				behavior: "smooth",
			});
		} else {
			document.getElementById(sectionId)?.scrollIntoView({
				behavior: "smooth",
			});
		}
	};

	return (
		<>
			{/* Menu rotatif */}
			<nav
				className="scroll-progress"
				aria-hidden="true"
				aria-label={
					currentLang === "fr"
						? "Indicateur de position secondaire"
						: "Secondary position indicator"
				}>
				{/* <nav
					className="scroll-progress"
					aria-label="Indicateur de position secondaire"> */}
				{sections.map((section) => (
					<a
						key={section.id}
						href={`#${section.id}`}
						className="scroll-progress__indicator"
						data-active={activeSection === section.id}
						tabIndex={-1}
						onClick={(e) => handleClick(e, section.id)}
						aria-label={
							section.ariaLabel[currentLang as keyof typeof section.ariaLabel]
						}
						// role="link"
					>
						{section.name}
					</a>
				))}
				{/* </nav> */}
			</nav>

			{/* Ligne de progression simple */}
			{/* <motion.div
				className="scroll-progress-line"
				style={{
					scaleY: scrollYProgress,
				}}
			/> */}
		</>
	);
}
