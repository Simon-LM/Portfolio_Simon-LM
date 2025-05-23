/** @format */

"use client";

// import { motion } from "framer-motion";
import Collapse from "../../../../components/collapse/Collapse";

// Types and Interfaces
interface HeroDictionary {
	title: string;
	subtitle: string;
	features: {
		title: string;
		description: string;
	}[];
}

interface HeroProps {
	dictionary: HeroDictionary;
}

// // Animation variants
// const containerVariants = {
// 	hidden: { opacity: 0, y: 20 },
// 	visible: {
// 		opacity: 1,
// 		y: 0,
// 		transition: {
// 			duration: 1.2,
// 			staggerChildren: 0.4,
// 			ease: "easeOut",
// 		},
// 	},
// };

// const itemVariants = {
// 	hidden: { opacity: 0, y: 20 },
// 	visible: {
// 		opacity: 1,
// 		y: 0,
// 		transition: {
// 			duration: 0.8,
// 			ease: "easeOut",
// 		},
// 	},
// };

// export default function HeroClient({ dictionary }: HeroProps) {
// 	return (
// 		<motion.section
// 			variants={containerVariants}
// 			initial="hidden"
// 			animate="visible"
// 			className="hero"
// 			id="main-content">
// 			<motion.div className="hero__content">
// 				<motion.h1
// 					variants={itemVariants}
// 					className="hero__title"
// 					id="hero-title"
// 					tabIndex={-1}>
// 					{dictionary.title}
// 				</motion.h1>
// 				<motion.div variants={itemVariants} className="hero__features">
// 					{dictionary.features.map((feature, index) => (
// 						<Collapse
// 							key={index}
// 							title={feature.title}
// 							id={`hero-collapse-${index}`}
// 							headingLevel="h2">
// 							{feature.description}
// 						</Collapse>
// 					))}
// 				</motion.div>
// 			</motion.div>
// 		</motion.section>
// 	);
// }

export default function HeroClient({ dictionary }: HeroProps) {
	return (
		<section className="hero" id="main-content">
			<div className="hero__content">
				<h1 className="hero__title" id="hero-title" tabIndex={-1}>
					{dictionary.title}
				</h1>
				<div className="hero__features">
					{dictionary.features.map((feature, index) => (
						<Collapse
							key={index}
							title={feature.title}
							id={`hero-collapse-${index}`}
							headingLevel="h2">
							{feature.description}
						</Collapse>
					))}
				</div>
			</div>
		</section>
	);
}
