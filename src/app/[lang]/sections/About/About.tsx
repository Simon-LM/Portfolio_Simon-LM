/** @format */

"use client";

import { motion } from "framer-motion";

interface AboutDictionary {
	title: string;
	subtitle: string;
	videoTitle: string;
}

interface AboutProps {
	dictionary: AboutDictionary;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 1.5,
			staggerChildren: 0.5,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 1 },
	},
};

export default function AboutClient({ dictionary }: AboutProps) {
	return (
		<motion.section
			id="about"
			className="about"
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			aria-labelledby="about-title">
			<motion.div className="content">
				<motion.h2 id="about-title" className="title" variants={itemVariants}>
					{dictionary.title}
				</motion.h2>
				<motion.p className="subtitle" variants={itemVariants}>
					{dictionary.subtitle}
				</motion.p>
				<motion.div className="video-wrapper" variants={itemVariants}>
					<iframe
						width="560"
						height="315"
						src="https://www.youtube.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
						title={dictionary.videoTitle}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				</motion.div>
			</motion.div>
		</motion.section>
	);
}
