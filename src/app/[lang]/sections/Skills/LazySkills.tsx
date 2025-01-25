/** @format */
// "use client";

// import { useEffect, useState } from "react";
// import { useInView } from "react-intersection-observer";
// import dynamic from "next/dynamic";
// import { SkillsDictionary } from "@/types/components/sections";

// const SkillsClient = dynamic(() => import("./Skills"), {
// 	ssr: false,
// });

// interface LazySkillsProps {
// 	dictionary: SkillsDictionary;
// }

// export const LazySkills = ({ dictionary }: LazySkillsProps) => {
// 	const { ref, inView } = useInView({ triggerOnce: true });
// 	const [showSkills, setShowSkills] = useState(false);

// 	useEffect(() => {
// 		if (inView) setShowSkills(true);
// 	}, [inView]);

// 	return (
// 		<section id="skills" className="skills" ref={ref}>
// 			{showSkills && <SkillsClient dictionary={dictionary} />}
// 		</section>
// 	);
// };

"use client";

import { useInView } from "react-intersection-observer";
import dynamic from "next/dynamic";
import { SkillsDictionary } from "@/types/components/sections";
import { useEffect, useState } from "react";

const SkillsClient = dynamic(() => import("./SkillsClient"), {
	ssr: false,
});

interface LazySkillsProps {
	dictionary: SkillsDictionary;
}

// export const LazySkills = ({ dictionary }: LazySkillsProps) => {
// 	const { ref, inView } = useInView({
// 		triggerOnce: true,
// 		threshold: 0.1,
// 		rootMargin: "100px",
// 	});

// 	return (
// 		<section
// 			id="skills"
// 			className={`skills ${!inView ? "skills--placeholder" : ""}`}
// 			ref={ref}>
// 			{inView && <SkillsClient dictionary={dictionary} />}
// 		</section>
// 	);

export const LazySkills = ({ dictionary }: LazySkillsProps) => {
	const [shouldLoad, setShouldLoad] = useState(false);
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	useEffect(() => {
		const aboutSection = document.getElementById("about");

		const handleAboutFocus = () => {
			setShouldLoad(true);
		};

		if (aboutSection) {
			aboutSection.addEventListener("focus", handleAboutFocus);
			aboutSection.addEventListener("focusin", handleAboutFocus);
		}

		return () => {
			if (aboutSection) {
				aboutSection.removeEventListener("focus", handleAboutFocus);
				aboutSection.removeEventListener("focusin", handleAboutFocus);
			}
		};
	}, []);

	return (
		<section
			id="skills"
			className={`skills ${!inView ? "skills--placeholder" : ""}`}
			ref={ref}>
			{(inView || shouldLoad) && <SkillsClient dictionary={dictionary} />}
		</section>
	);
};
