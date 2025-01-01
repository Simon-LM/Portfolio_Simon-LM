/** @format */

"use client";

import { motion } from "framer-motion";

interface PortfolioDictionary {
	title: string;
	subtitle: string;
	projects: {
		title: string;
		description: string;
		tags: string[];
		imageUrl: string;
		imageAlt: string;
		link: string;
	}[];
}

interface PortfolioProps {
	dictionary: PortfolioDictionary;
}

export default function PortfolioClient({ dictionary }: PortfolioProps) {
	return (
		<motion.section id="portfolio" className="portfolio">
			<div className="portfolio__container">
				<h2 className="portfolio__title">{dictionary.title}</h2>
				<p className="portfolio__subtitle">{dictionary.subtitle}</p>

				<div className="portfolio__grid">
					{dictionary.projects.map((project, index) => (
						<motion.article key={index} className="portfolio__card">
							{/* ... rest of the component ... */}
						</motion.article>
					))}
				</div>
			</div>
		</motion.section>
	);
}
