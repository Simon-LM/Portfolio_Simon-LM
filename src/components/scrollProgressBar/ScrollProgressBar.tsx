/** @format */

"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
// import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";

interface Section {
	id: string;
	name: ReactNode; // Au lieu de JSX.Element
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
			<motion.div className="scroll-progress">
				{sections.map((section) => (
					<motion.a
						key={section.id}
						href={`#${section.id}`}
						className="scroll-progress__indicator"
						data-active={activeSection === section.id}
						onClick={(e) => handleClick(e, section.id)}
						aria-label={section.ariaLabel}
						role="link">
						{section.name}
					</motion.a>
				))}
			</motion.div>

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
