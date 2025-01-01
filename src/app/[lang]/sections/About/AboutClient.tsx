/** @format */
// "use client";

// import { motion } from "framer-motion";

// interface AboutDictionary {
// 	title: string;
// 	subtitle: string;
// 	videoTitle: string;
// }

// interface AboutProps {
// 	dictionary: AboutDictionary;
// }

// const containerVariants = {
// 	hidden: { opacity: 0 },
// 	visible: {
// 		opacity: 1,
// 		transition: {
// 			duration: 1.5,
// 			staggerChildren: 0.5,
// 		},
// 	},
// };

// const itemVariants = {
// 	hidden: { opacity: 0, y: 20 },
// 	visible: {
// 		opacity: 1,
// 		y: 0,
// 		transition: { duration: 1 },
// 	},
// };

// export default function AboutClient({ dictionary }: AboutProps) {
// 	return (
// 		<motion.section
// 			id="about"
// 			className="about"
// 			variants={containerVariants}
// 			initial="hidden"
// 			whileInView="visible"
// 			viewport={{ once: true }}>
// 			<div className="about__container">
// 				<motion.h2 className="about__title" variants={itemVariants}>
// 					{dictionary.title}
// 				</motion.h2>
// 				{/* <motion.p className="about__subtitle" variants={itemVariants}>
// 					{dictionary.subtitle}
// 				</motion.p> */}
// 				<motion.div className="about__video" variants={itemVariants}>
// 					<iframe
// 						className="about__video-frame"
// 						src="https://www.youtube.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
// 						title={dictionary.videoTitle}
// 						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
// 						referrerPolicy="strict-origin-when-cross-origin"
// 						allowFullScreen
// 					/>
// 				</motion.div>
// 			</div>
// 		</motion.section>
// 	);
// }

"use client";

interface AboutDictionary {
	title: string;
	subtitle: string;
	videoTitle: string;
}

interface AboutProps {
	dictionary: AboutDictionary;
}

export default function AboutClient({ dictionary }: AboutProps) {
	return (
		<section id="about" className="about">
			<div className="about__container">
				<h2 className="about__title">{dictionary.title}</h2>
				<p className="about__subtitle">{dictionary.subtitle}</p>
				<div className="about__video">
					<iframe
						className="about__video-frame"
						src="https://www.youtube.com/embed/GeMASrgF1Hg?si=mkehlWufiSG_j0tu"
						title={dictionary.videoTitle}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						allowFullScreen
					/>
				</div>
			</div>
		</section>
	);
}
