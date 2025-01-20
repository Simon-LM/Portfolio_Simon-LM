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

const SkillsClient = dynamic(() => import("./Skills"), {
	ssr: false,
});

interface LazySkillsProps {
	dictionary: SkillsDictionary;
}

export const LazySkills = ({ dictionary }: LazySkillsProps) => {
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
		rootMargin: "100px",
	});

	return (
		<section
			id={inView ? "skills" : "skills-placeholder"}
			className="skills"
			ref={ref}>
			{inView && <SkillsClient dictionary={dictionary} />}
		</section>
	);
};
