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

const PortfolioClient = dynamic(() => import("./PortfolioClient"), {
	ssr: false,
});

interface LazyPortfolioProps {
	dictionary: PortfolioDictionary;
}

export const LazyPortfolio = ({ dictionary }: LazyPortfolioProps) => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	return (
		<section
			id={inView ? "portfolio" : "portfolio-placeholder"}
			className="portfolio"
			ref={ref}>
			{inView && <PortfolioClient dictionary={dictionary} />}
		</section>
	);
};
