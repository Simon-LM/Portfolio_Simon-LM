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
import MarkdownText from "../../../../utils/MarkdownText";

interface SkillsDictionary {
	title: string;
	presentation: string;
	competences: {
		frontend: { title: string; items: string[] };
		backend: { title: string; items: string[] };
		tools: { title: string; items: string[] };
		closingText: string;
	};
}

interface SkillsProps {
	dictionary: SkillsDictionary;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.3,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, x: -50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.8,
			ease: "easeOut",
		},
	},
};

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
	hidden: { opacity: 0, x: -100 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const iconVariants = {
	hidden: { opacity: 0, x: -50 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut",
		},
	},
};

export default function Skills({ dictionary }: SkillsProps) {
	return (
		<motion.section
			className="skills"
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}>
			<div className="skills__container">
				<motion.h2 className="skills__title" variants={itemVariants}>
					{dictionary.title}
				</motion.h2>
				<motion.p className="skills__presentation" variants={itemVariants}>
					{dictionary.presentation}
				</motion.p>

				<motion.div
					className="skills__icons-container"
					variants={techIconsVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}>
					<motion.div className="skills__icons-group">
						{frontendIcons.map(({ Icon, label }) => (
							<motion.div
								key={label}
								className="skills__icon-wrapper"
								variants={iconVariants}>
								<Icon className="skills__icon" />
								<span className="skills__icon-label">{label}</span>
							</motion.div>
						))}
					</motion.div>

					<motion.div className="skills__icons-group">
						{styleIcons.map(({ Icon, label }) => (
							<motion.div
								key={label}
								className="skills__icon-wrapper"
								variants={iconVariants}>
								<Icon className="skills__icon" />
								<span className="skills__icon-label">{label}</span>
							</motion.div>
						))}
					</motion.div>
				</motion.div>

				<div className="skills__content">
					<motion.div className="skills__cards" variants={containerVariants}>
						{/* Frontend Card */}
						<motion.div className="skills__card" variants={itemVariants}>
							<h3 className="skills__card-title">
								{dictionary.competences.frontend.title}
							</h3>
							<ul className="skills__card-list">
								{dictionary.competences.frontend.items.map((item, index) => (
									<li key={index} className="skills__card-item">
										<MarkdownText text={item} />
									</li>
								))}
							</ul>
						</motion.div>

						{/* Backend Card */}
						<motion.div className="skills__card" variants={itemVariants}>
							<h3 className="skills__card-title">
								{dictionary.competences.backend.title}
							</h3>
							<ul className="skills__card-list">
								{dictionary.competences.backend.items.map((item, index) => (
									<li key={index} className="skills__card-item">
										<MarkdownText text={item} />
									</li>
								))}
							</ul>
						</motion.div>
					</motion.div>

					{/* <motion.p className="skills__closing" variants={itemVariants}>
						{dictionary.competences.closingText}
					</motion.p> */}
				</div>
			</div>
		</motion.section>
	);
}
