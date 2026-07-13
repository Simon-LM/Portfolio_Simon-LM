/** @format */

// "use client";

// import { useInView } from "react-intersection-observer";
// import dynamic from "next/dynamic";
// import { AboutDictionary } from "@/types/components/sections";

// const AboutClient = dynamic(() => import("./AboutClient"), {
// 	ssr: false,
// });

// interface LazyAboutProps {
// 	dictionary: AboutDictionary;
// }

// export const LazyAbout = ({ dictionary }: LazyAboutProps) => {
// 	const { ref, inView } = useInView({
// 		triggerOnce: true,
// 		threshold: 0.1, // Triggers loading when 10% of the section is visible
// 		rootMargin: "100px", // Preload 100px before the section is visible
// 	});

// 	return (
// 		<section
// 			id="about"
// 			className={`about ${!inView ? "about--placeholder" : ""}`}
// 			ref={ref}>
// 			{inView && <AboutClient dictionary={dictionary} />}
// 		</section>
// 	);
// };

"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { AboutDictionary } from "@/types/components/sections";

const AboutClient = dynamic(() => import("./AboutClient"), {
	ssr: false,
});

interface LazyAboutProps {
	dictionary: AboutDictionary;
}

export const LazyAbout = ({ dictionary }: LazyAboutProps) => {
	const [shouldLoad, setShouldLoad] = useState(false);
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	useEffect(() => {
		const heroSection = document.getElementById("main-content");

		const handleHeroFocus = () => {
			setShouldLoad(true);
		};

		if (heroSection) {
			heroSection.addEventListener("focus", handleHeroFocus);
			heroSection.addEventListener("focusin", handleHeroFocus);
		}

		return () => {
			if (heroSection) {
				heroSection.removeEventListener("focus", handleHeroFocus);
				heroSection.removeEventListener("focusin", handleHeroFocus);
			}
		};
	}, []);

	return (
		<section
			id="about"
			className={`about ${!inView ? "about--placeholder" : ""}`}
			ref={ref}>
			{(inView || shouldLoad) && <AboutClient dictionary={dictionary} />}
		</section>
	);
};
