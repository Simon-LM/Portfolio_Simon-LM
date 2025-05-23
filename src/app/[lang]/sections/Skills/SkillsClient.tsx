/** @format */

"use client";

import { motion } from "framer-motion";
import {
	SiReact,
	SiNextdotjs,
	SiTypescript,
	SiSass,
	SiTailwindcss,
} from "react-icons/si";
import MarkdownText from "@/utils/MarkdownText";
import { useState } from "react";
import { IconType } from "react-icons";

interface SkillsDictionary {
	title: string;
	presentation: string;
	competences: {
		frontend: { title: string; items: string[]; ariaLabel?: string };
		backend: { title: string; items: string[]; ariaLabel?: string };
		tools: { title: string; items: string[] };
		closingText: string;
	};
}

interface SkillsProps {
	dictionary: SkillsDictionary;
}
interface IconWrapperProps {
	Icon: IconType;
	label: string;
}

const IconWrapper = ({ Icon, label }: IconWrapperProps) => {
	const [isRotating, setIsRotating] = useState(false);

	const handleMouseEnter = () => {
		if (!isRotating) {
			setIsRotating(true);
			setTimeout(() => setIsRotating(false), 1250);
		}
	};

	return (
		<motion.div
			key={label}
			className={`skills__icon-wrapper ${isRotating ? "is-rotating" : ""}`}
			variants={iconVariants}
			onMouseEnter={handleMouseEnter}>
			<Icon className="skills__icon" />
			<span className="skills__icon-label">{label}</span>
		</motion.div>
	);
};

// const containerVariants = {
// 	hidden: { opacity: 0 },
// 	visible: {
// 		opacity: 1,
// 		transition: {
// 			staggerChildren: 0.3,
// 		},
// 	},
// };

// const itemVariants = {
// 	hidden: { opacity: 0, x: -50 },
// 	visible: {
// 		opacity: 1,
// 		x: 0,
// 		transition: {
// 			duration: 0.8,
// 			ease: "easeOut",
// 		},
// 	},
// };

const frontendIcons = [
	{ Icon: SiReact, label: "React.js" },
	{ Icon: SiNextdotjs, label: "Next.js" },
	{ Icon: SiTypescript, label: "TypeScript" },
];

const styleIcons = [
	{ Icon: SiSass, label: "SCSS" },
	{ Icon: SiTailwindcss, label: "Tailwind" },
];

const techIconsVariants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2, // Ralentir le délai entre chaque icône
			delayChildren: 0.5, // Augmenter le délai initial
		},
	},
};

const iconVariants = {
	hidden: {
		opacity: 0,
		x: -100,
		rotate: -180,
		scale: 0.5,
	},
	visible: {
		opacity: 1,
		x: 0,
		rotate: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 70, // Réduire la rigidité
			damping: 15, // Augmenter l'amortissement
			mass: 1, // Augmenter la masse
			duration: 2.5, // Augmenter la durée
		},
	},
};

// export default function Skills({ dictionary }: SkillsProps) {
// 	return (
// 		<motion.section
// 			className="skills"
// 			variants={containerVariants}
// 			initial="hidden"
// 			whileInView="visible"
// 			viewport={{ once: true }}>
// 			<div className="skills__container">
// 				<motion.h2 className="skills__title" variants={itemVariants}>
// 					{dictionary.title}
// 				</motion.h2>
// 				<motion.p className="skills__presentation" variants={itemVariants}>
// 					{dictionary.presentation}
// 				</motion.p>

// 				<motion.div
// 					className="skills__icons-container"
// 					variants={techIconsVariants}
// 					initial="hidden"
// 					whileInView="visible"
// 					viewport={{ once: true }}>
// 					<motion.div className="skills__icons-group">
// 						{/* {frontendIcons.map(({ Icon, label }) => (
// 							<motion.div
// 								key={label}
// 								className="skills__icon-wrapper"
// 								variants={iconVariants}>
// 								<Icon className="skills__icon" />
// 								<span className="skills__icon-label">{label}</span>
// 							</motion.div>
// 						))} */}
// 						{frontendIcons.map(({ Icon, label }) => (
// 							<IconWrapper key={label} Icon={Icon} label={label} />
// 						))}
// 					</motion.div>

// 					<motion.div className="skills__icons-group">
// 						{/* {styleIcons.map(({ Icon, label }) => (
// 							<motion.div
// 								key={label}
// 								className="skills__icon-wrapper"
// 								variants={iconVariants}>
// 								<Icon className="skills__icon" />
// 								<span className="skills__icon-label">{label}</span>
// 							</motion.div>
// 						))} */}
// 						{styleIcons.map(({ Icon, label }) => (
// 							<IconWrapper key={label} Icon={Icon} label={label} />
// 						))}
// 					</motion.div>
// 				</motion.div>

// 				<div className="skills__content">
// 					<motion.div className="skills__cards" variants={containerVariants}>
// 						{/* Frontend Card */}
// 						<motion.div className="skills__card" variants={itemVariants}>
// 							<h3
// 								className="skills__card-title"
// 								aria-label={dictionary.competences.frontend.ariaLabel}>
// 								{dictionary.competences.frontend.title}
// 							</h3>
// 							<ul className="skills__card-list">
// 								{dictionary.competences.frontend.items.map((item, index) => (
// 									<li key={index} className="skills__card-item">
// 										<MarkdownText text={item} />
// 									</li>
// 								))}
// 							</ul>
// 						</motion.div>

// 						{/* Backend Card */}
// 						<motion.div className="skills__card" variants={itemVariants}>
// 							<h3
// 								className="skills__card-title"
// 								aria-label={dictionary.competences.backend.ariaLabel}>
// 								{dictionary.competences.backend.title}
// 							</h3>
// 							<ul className="skills__card-list">
// 								{dictionary.competences.backend.items.map((item, index) => (
// 									<li key={index} className="skills__card-item">
// 										<MarkdownText text={item} />
// 									</li>
// 								))}
// 							</ul>
// 						</motion.div>
// 					</motion.div>

// 					{/* <motion.p className="skills__closing" variants={itemVariants}>
// 						{dictionary.competences.closingText}
// 					</motion.p> */}
// 				</div>
// 			</div>
// 		</motion.section>
// 	);
// }

export default function Skills({ dictionary }: SkillsProps) {
	return (
		<section className="skills">
			<div className="skills__container">
				<h2 className="skills__title">{dictionary.title}</h2>
				<p className="skills__presentation">{dictionary.presentation}</p>

				<motion.div
					className="skills__icons-container"
					variants={techIconsVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}>
					<motion.div className="skills__icons-group">
						{frontendIcons.map(({ Icon, label }) => (
							<IconWrapper key={label} Icon={Icon} label={label} />
						))}
					</motion.div>

					<motion.div className="skills__icons-group">
						{styleIcons.map(({ Icon, label }) => (
							<IconWrapper key={label} Icon={Icon} label={label} />
						))}
					</motion.div>
				</motion.div>

				<div className="skills__content">
					<div className="skills__cards">
						{/* Frontend Card */}
						<div className="skills__card">
							<h3
								className="skills__card-title"
								aria-label={dictionary.competences.frontend.ariaLabel}>
								{dictionary.competences.frontend.title}
							</h3>
							<ul className="skills__card-list">
								{dictionary.competences.frontend.items.map((item, index) => (
									<li key={index} className="skills__card-item">
										<MarkdownText text={item} />
									</li>
								))}
							</ul>
						</div>

						{/* Backend Card */}
						<div className="skills__card">
							<h3
								className="skills__card-title"
								aria-label={dictionary.competences.backend.ariaLabel}>
								{dictionary.competences.backend.title}
							</h3>
							<ul className="skills__card-list">
								{dictionary.competences.backend.items.map((item, index) => (
									<li key={index} className="skills__card-item">
										<MarkdownText text={item} />
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
