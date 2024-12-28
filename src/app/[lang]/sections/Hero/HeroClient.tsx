/** @format */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface HeroDictionary {
	title: string;
	subtitle: string;
	imageAlt: string;
	cta: string;
	ctaAriaLabel: string;
}

interface HeroProps {
	dictionary: HeroDictionary;
}

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 1.2, // Plus lent (était 0.6)
			staggerChildren: 0.4, // Plus d'espace entre les animations (était 0.2)
			ease: "easeOut", // Animation plus douce
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: "easeOut",
		},
	},
};

const imageVariants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			duration: 1,
			type: "spring",
			stiffness: 50,
			damping: 15,
		},
	},
};

export default function HeroClient({ dictionary }: HeroProps) {
	return (
		<motion.section
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="hero">
			<motion.div className="content">
				<motion.h2 variants={itemVariants} className="title">
					{dictionary.title}
				</motion.h2>
				<motion.p variants={itemVariants} className="subtitle">
					{dictionary.subtitle}
				</motion.p>
				<motion.div variants={imageVariants} className="imageWrapper">
					<Image
						src="/hero-image.webp"
						alt={dictionary.imageAlt}
						width={500}
						height={300}
						priority
					/>
				</motion.div>
			</motion.div>
		</motion.section>
	);
}
