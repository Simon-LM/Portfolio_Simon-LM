/** @format */
// "use client";

// import { useEffect, useState } from "react";
// import { useInView } from "react-intersection-observer";
// import dynamic from "next/dynamic";
// import { PortfolioDictionary } from "@/types/components/sections";

// const PortfolioClient = dynamic(() => import("./PortfolioClient"), {
// 	ssr: false,
// });

// interface LazyPortfolioProps {
// 	dictionary: PortfolioDictionary;
// }

// export const LazyPortfolio = ({ dictionary }: LazyPortfolioProps) => {
// 	const { ref, inView } = useInView({ triggerOnce: true });
// 	const [showPortfolio, setShowPortfolio] = useState(false);

// 	useEffect(() => {
// 		if (inView) setShowPortfolio(true);
// 	}, [inView]);

// 	return (
// 		<section id="portfolio" className="portfolio" ref={ref}>
// 			{showPortfolio && <PortfolioClient dictionary={dictionary} />}
// 		</section>
// 	);
// };

"use client";

import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { PortfolioDictionary } from "@/types/components/sections";
import { useEffect, useState } from "react";

const PortfolioClient = dynamic(() => import("./PortfolioClient"), {
	ssr: false,
});

interface LazyPortfolioProps {
	dictionary: PortfolioDictionary;
}

// export const LazyPortfolio = ({ dictionary }: LazyPortfolioProps) => {
// 	const { ref, inView } = useInView({
// 		triggerOnce: true,
// 		threshold: 0.1,
// 		rootMargin: "100px",
// 	});

// 	return (
// 		<section
// 			id="portfolio" // ID constant pour la navigation
// 			className={`portfolio ${!inView ? "portfolio--placeholder" : ""}`}
// 			ref={ref}>
// 			{inView && <PortfolioClient dictionary={dictionary} />}
// 		</section>
// 	);

export const LazyPortfolio = ({ dictionary }: LazyPortfolioProps) => {
	const [shouldLoad, setShouldLoad] = useState(false);
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	useEffect(() => {
		const skillsSection = document.getElementById("skills");

		const handleSkillsFocus = () => {
			setShouldLoad(true);
		};

		if (skillsSection) {
			skillsSection.addEventListener("focus", handleSkillsFocus);
			skillsSection.addEventListener("focusin", handleSkillsFocus);
		}

		return () => {
			if (skillsSection) {
				skillsSection.removeEventListener("focus", handleSkillsFocus);
				skillsSection.removeEventListener("focusin", handleSkillsFocus);
			}
		};
	}, []);

	return (
		<section
			id="portfolio"
			className={`portfolio ${!inView ? "portfolio--placeholder" : ""}`}
			ref={ref}>
			{(inView || shouldLoad) && <PortfolioClient dictionary={dictionary} />}
		</section>
	);
};
