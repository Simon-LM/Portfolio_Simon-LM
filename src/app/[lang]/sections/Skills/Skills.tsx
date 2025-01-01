/** @format */

"use client";

import { motion } from "framer-motion";

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

export default function Skills({ dictionary }: SkillsProps) {
	return (
		<motion.section
			className="skills"
			id="skills"
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
										{item}
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
										{item}
									</li>
								))}
							</ul>
						</motion.div>

						{/* Tools Card */}
						<motion.div className="skills__card" variants={itemVariants}>
							<h3 className="skills__card-title">
								{dictionary.competences.tools.title}
							</h3>
							<ul className="skills__card-list">
								{dictionary.competences.tools.items.map((item, index) => (
									<li key={index} className="skills__card-item">
										{item}
									</li>
								))}
							</ul>
						</motion.div>
					</motion.div>

					<motion.p className="skills__closing" variants={itemVariants}>
						{dictionary.competences.closingText}
					</motion.p>
				</div>
			</div>
		</motion.section>
	);
}
