/** @format */

/** @format */

"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
// import { motion } from "framer-motion";
// import { motion, useScroll } from "framer-motion";

import { BsChevronUp, BsChevronDown } from "react-icons/bs";

interface Section {
	id: string;
	name: ReactNode;
	ariaLabel: string;
}

const sections: Section[] = [
	{
		id: "hero",
		name: <BsChevronUp size={16} className="scroll-progress__arrows" />,
		ariaLabel: "Retourner en haut de la page",
	},
	{ id: "about", name: "Why?", ariaLabel: "Aller à la section Pourquoi ?" },
	{
		id: "skills",
		name: "Skills",
		ariaLabel: "Aller à la section compétences",
	},
	{
		id: "portfolio",
		name: "Portfolio",
		ariaLabel: "Aller à la section portfolio",
	},
	{ id: "contact", name: "Contact", ariaLabel: "Aller à la section contact" },
	{
		id: "bottomFooter",
		name: <BsChevronDown size={16} className="scroll-progress__arrows" />,
		ariaLabel: "Aller en bas de la page",
	},
];

export default function ScrollProgressBar() {
	const navRef = useRef<HTMLElement>(null);
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

	useEffect(() => {
		const darkLinkColor = "#d6d3d1";
		const lightLinkColor = "#78716c";
		const newColor =
			activeSection === "bottomFooter" ? darkLinkColor : lightLinkColor;
		if (navRef.current) {
			navRef.current.style.setProperty(
				"--scroll-progress-link-color",
				newColor
			);
		}
	}, [activeSection]);

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
			{/* Rotary menu */}
			<nav
				ref={navRef}
				className="scroll-progress"
				aria-hidden="true"
				aria-label="Indicateur de position secondaire">
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
						// aria-label={section.ariaLabel}
						// role="link"
					>
						{section.name}
					</a>
				))}
				{/* </nav> */}
			</nav>

			{/* Simple progress line */}
			{/* <motion.div
				className="scroll-progress-line"
				style={{
					scaleY: scrollYProgress,
				}}
			/> */}
		</>
	);
}
