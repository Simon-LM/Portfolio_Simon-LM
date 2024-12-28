/** @format */

"use client";

import { motion } from "framer-motion";

interface Skill {
	name: string;
	level: number;
	category: string;
}

interface SkillsDictionary {
	title: string;
	subtitle: string;
	skills: Skill[];
}

interface SkillsProps {
	dictionary: SkillsDictionary;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 1.5,
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.8 },
	},
};

const barVariants = {
	hidden: { scaleX: 0 },
	visible: {
		scaleX: 1,
		transition: { duration: 1, ease: "easeOut" },
	},
};

export default function SkillsClient({ dictionary }: SkillsProps) {
	return (
		<motion.section
			id="skills"
			className="skills"
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{
				once: true,
				amount: 0.3,
				margin: "-100px",
			}}
			aria-labelledby="skills-title">
			<motion.div className="content">
				<motion.h2 id="skills-title" className="title" variants={itemVariants}>
					{dictionary.title}
				</motion.h2>
				<motion.p className="subtitle" variants={itemVariants}>
					{dictionary.subtitle}
				</motion.p>
				<div className="skills-grid">
					{dictionary.skills.map((skill) => (
						<motion.div
							key={skill.name}
							className="skill-item"
							variants={itemVariants}>
							<span className="skill-name">{skill.name}</span>
							<motion.div
								className="skill-bar"
								variants={barVariants}
								style={{ transformOrigin: "left" }}
								custom={skill.level}>
								<div
									className="skill-level"
									style={{ width: `${skill.level}%` }}
									role="progressbar"
									aria-valuenow={skill.level}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label={`${skill.name}: ${skill.level}%`}
								/>
							</motion.div>
						</motion.div>
					))}
				</div>
			</motion.div>
		</motion.section>
	);
}
