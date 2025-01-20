/** @format */
// "use client";

// import { useEffect, useState } from "react";
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
// 	const { ref, inView } = useInView({ triggerOnce: true });
// 	const [showAbout, setShowAbout] = useState(false);

// 	useEffect(() => {
// 		if (inView) setShowAbout(true);
// 	}, [inView]);

// 	return (
// 		<section id="about" className="about" ref={ref}>
// 			{showAbout && <AboutClient dictionary={dictionary} />}
// 		</section>
// 	);
// };

"use client";

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
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1, // Déclenche le chargement quand 10% de la section est visible
		rootMargin: "100px", // Pré-charge 100px avant que la section soit visible
	});

	return (
		<section
			id={inView ? "about" : "about-placeholder"}
			className="about"
			ref={ref}>
			{inView && <AboutClient dictionary={dictionary} />}
		</section>
	);
};
