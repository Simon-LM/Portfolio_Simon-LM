/** @format */

// "use client";

// import { useEffect, useState } from "react";
// import { motion, useScroll } from "framer-motion";

// interface Section {
// 	id: string;
// 	name: string;
// }

// const sections: Section[] = [
// 	{ id: "hero", name: "Hero" },
// 	{ id: "about", name: "About" },
// 	{ id: "skills", name: "Skills" },
// ];

// export default function ScrollProgressBar() {
// 	const [activeSection, setActiveSection] = useState<string>("hero");
// 	const { scrollYProgress } = useScroll();

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			const pageHeight =
// 				document.documentElement.scrollHeight - window.innerHeight;
// 			const currentScroll = window.scrollY;

// 			sections.forEach((section) => {
// 				const element = document.getElementById(section.id);
// 				if (element) {
// 					const rect = element.getBoundingClientRect();
// 					if (
// 						rect.top <= window.innerHeight / 2 &&
// 						rect.bottom >= window.innerHeight / 2
// 					) {
// 						setActiveSection(section.id);
// 					}
// 				}
// 			});
// 		};

// 		window.addEventListener("scroll", handleScroll);
// 		return () => window.removeEventListener("scroll", handleScroll);
// 	}, []);

// 	return (
// 		<motion.div
// 			className="scroll-progress"
// 			style={{
// 				position: "fixed",
// 				right: "20px",
// 				top: "50%",
// 				transform: "translateY(-50%)",
// 				zIndex: 100,
// 			}}>
// 			{sections.map((section) => (
// 				<motion.div
// 					key={section.id}
// 					className="section-indicator"
// 					style={{
// 						margin: "10px 0",
// 						width: "10px",
// 						height: "10px",
// 						borderRadius: "50%",
// 						backgroundColor: activeSection === section.id ? "#0070f3" : "#ddd",
// 						transition: "background-color 0.3s ease",
// 					}}
// 				/>
// 			))}
// 			<motion.div
// 				className="progress-line"
// 				style={{
// 					position: "absolute",
// 					left: "4px",
// 					top: 0,
// 					width: "2px",
// 					height: "100%",
// 					backgroundColor: "#ddd",
// 					transformOrigin: "top",
// 					scaleY: scrollYProgress,
// 				}}
// 			/>
//         </motion.div>
//         {sections.map((section) => (
//             <motion.div
//               key={section.id}
//               className="section-indicator"
//               style={{
//                 margin: "15px 0",
//                 padding: "5px 10px",
//                 fontSize: "14px",
//                 fontWeight: activeSection === section.id ? "600" : "400",
//                 color: activeSection === section.id ? "#0070f3" : "#666",
//                 transition: "all 0.3s ease",
//                 cursor: "default",
//                 textTransform: "uppercase",
//                 letterSpacing: "1px"
//               }}
//             >
//               {section.name}
//             </motion.div>
//           ))}
//           <motion.div
//             className="progress-line"
//             style={{
//               position: "absolute",
//               left: "-10px",
//               top: 0,
//               width: "2px",
//               height: "100%",
//               backgroundColor: "#ddd",
//               transformOrigin: "top",
//               scaleY: scrollYProgress
//             }}
//           />
// 	);
// }

// // // // // // // // // // // // // // // // //

// "use client";

// import { useEffect, useState } from "react";
// import { motion, useScroll } from "framer-motion";

// interface Section {
// 	id: string;
// 	name: string;
// }

// const sections: Section[] = [
// 	{ id: "hero", name: "Hero" },
// 	{ id: "about", name: "About" },
// 	{ id: "skills", name: "Skills" },
// ];

// export default function ScrollProgressBar() {
// 	const [activeSection, setActiveSection] = useState<string>("hero");
// 	const { scrollYProgress } = useScroll();

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			sections.forEach((section) => {
// 				const element = document.getElementById(section.id);
// 				if (element) {
// 					const rect = element.getBoundingClientRect();
// 					if (
// 						rect.top <= window.innerHeight / 2 &&
// 						rect.bottom >= window.innerHeight / 2
// 					) {
// 						setActiveSection(section.id);
// 					}
// 				}
// 			});
// 		};

// 		window.addEventListener("scroll", handleScroll);
// 		return () => window.removeEventListener("scroll", handleScroll);
// 	}, []);

// 	return (
// 		<motion.div
// 			className="scroll-progress"
// 			style={{
// 				position: "fixed",
// 				right: "1rem", // there
// 				top: "50%",
// 				transform: "translateY(-50%)",
// 				zIndex: 100,
// 				display: "flex",
// 				flexDirection: "column",
// 				alignItems: "flex-end",
// 			}}>
// 			{sections.map((section) => (
// 				<motion.div
// 					key={section.id}
// 					className="section-indicator"
// 					style={{
// 						margin: "25px 0",
// 						padding: "1.5rem 0.2rem", // there
// 						fontSize: "14px",
// 						fontWeight: activeSection === section.id ? "600" : "400",
// 						color: activeSection === section.id ? "#0070f3" : "#666",
// 						transition: "all 0.3s ease",
// 						cursor: "default",
// 						textTransform: "uppercase",
// 						letterSpacing: "1px",
// 						transform: "rotate(-90deg)",
// 						transformOrigin: "right center",
// 						whiteSpace: "nowrap",
// 					}}>
// 					{section.name}
// 				</motion.div>
// 			))}
// 			<motion.div
// 				className="progress-line"
// 				style={{
// 					position: "absolute",
// 					left: "3rem", // there
// 					top: 0,
// 					width: "2px",
// 					height: "100%",
// 					backgroundColor: "#ddd",
// 					transformOrigin: "top",
// 					scaleY: scrollYProgress,
// 				}}
// 			/>
// 		</motion.div>
// 	);
// }

// // // // // // // // // // // // // // // // // // //

// "use client";

// import { useEffect, useState } from "react";
// import { motion, useScroll } from "framer-motion";

// interface Section {
// 	id: string;
// 	name: string;
// }

// const sections: Section[] = [
// 	{ id: "hero", name: "Hero" },
// 	{ id: "about", name: "About" },
// 	{ id: "skills", name: "Skills" },
// ];

// export default function ScrollProgressBar() {
// 	const [activeSection, setActiveSection] = useState<string>("hero");
// 	const { scrollYProgress } = useScroll();

// 	// useEffect(() => {
// 	// 	const handleScroll = () => {
// 	// 		sections.forEach((section) => {
// 	// 			const element = document.getElementById(section.id);
// 	// 			if (element) {
// 	// 				const rect = element.getBoundingClientRect();
// 	// 				if (
// 	// 					rect.top <= window.innerHeight / 2 &&
// 	// 					rect.bottom >= window.innerHeight / 2
// 	// 				) {
// 	// 					setActiveSection(section.id);
// 	// 				}
// 	// 			}
// 	// 		});
// 	// 	};

// 	// 	window.addEventListener("scroll", handleScroll);
// 	// 	return () => window.removeEventListener("scroll", handleScroll);
// 	// }, []);

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
// 			const scrollPosition = window.scrollY + window.innerHeight;
// 			const documentHeight = document.documentElement.scrollHeight;

// 			// Vérification pour le bas de page
// 			if (scrollPosition >= documentHeight - 100) {
// 				setActiveSection(sections[sections.length - 1].id);
// 				return;
// 			}

// 			// Vérification pour le haut de page
// 			if (window.scrollY <= headerHeight) {
// 				setActiveSection("hero");
// 				return;
// 			}

// 			sections.forEach((section) => {
// 				const element = document.getElementById(section.id);
// 				if (element) {
// 					const rect = element.getBoundingClientRect();
// 					const topThreshold = window.innerHeight * 0.4;
// 					const bottomThreshold = window.innerHeight * 0.6;

// 					if (rect.top <= topThreshold && rect.bottom >= bottomThreshold) {
// 						setActiveSection(section.id);
// 					}
// 				}
// 			});
// 		};

// 		window.addEventListener("scroll", handleScroll);
// 		handleScroll();
// 		return () => window.removeEventListener("scroll", handleScroll);
// 	}, []);

// 	return (
// 		<motion.div
// 			className="scroll-progress"
// 			style={{
// 				position: "fixed",
// 				right: "1rem",
// 				top: "50%",
// 				transform: "translateY(-50%)",
// 				zIndex: 100,
// 				display: "flex",
// 				flexDirection: "column",
// 				alignItems: "flex-end",
// 				height: "50vh", // Hauteur fixe pour le conteneur
// 				justifyContent: "space-between", // Distribution égale
// 			}}>
// 			{sections.map((section) => (
// 				<motion.div
// 					key={section.id}
// 					className="section-indicator"
// 					style={{
// 						margin: `${3}vh 0`, // Espacement adaptatif
// 						padding: "1rem 0.2rem",
// 						fontSize: "0.875rem",
// 						color: activeSection === section.id ? "#0070f3" : "#666",
// 						transition: "all 0.3s ease",
// 						cursor: "default",
// 						textTransform: "uppercase",
// 						letterSpacing: "0.0625rem",
// 						transform: "rotate(-90deg)",
// 						transformOrigin: "right center",
// 						whiteSpace: "nowrap",
// 					}}>
// 					{section.name}
// 				</motion.div>
// 			))}
// 			<motion.div
// 				className="progress-line"
// 				style={{
// 					position: "absolute",
// 					left: "3rem",
// 					top: 0,
// 					width: "0.125rem",
// 					height: "100%",
// 					backgroundColor: "#0070f3",
// 					transformOrigin: "top",
// 					scaleY: scrollYProgress,
// 				}}
// 			/>
// 		</motion.div>
// 	);
// }

// // // // // // // // // // // // // // // // // // // //

"use client";

import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

interface Section {
	id: string;
	name: string;
	ariaLabel: string;
}

const sections: Section[] = [
	{ id: "hero", name: "Hero", ariaLabel: "Aller à la section d'accueil" },
	{ id: "about", name: "About", ariaLabel: "Aller à la section à propos" },
	{ id: "skills", name: "Skills", ariaLabel: "Aller à la section compétences" },
];

export default function ScrollProgressBar() {
	const [activeSection, setActiveSection] = useState<string>("hero");
	const { scrollYProgress } = useScroll();

	useEffect(() => {
		const handleScroll = () => {
			const headerHeight = document.querySelector("header")?.offsetHeight || 0;
			const scrollPosition = window.scrollY + window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;

			if (scrollPosition >= documentHeight - 100) {
				setActiveSection(sections[sections.length - 1].id);
				return;
			}

			if (window.scrollY <= headerHeight) {
				setActiveSection("hero");
				return;
			}

			sections.forEach((section) => {
				const element = document.getElementById(section.id);
				if (element) {
					const rect = element.getBoundingClientRect();
					const topThreshold = window.innerHeight * 0.4;
					const bottomThreshold = window.innerHeight * 0.6;

					if (rect.top <= topThreshold && rect.bottom >= bottomThreshold) {
						setActiveSection(section.id);
					}
				}
			});
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.div
			className="scroll-progress"
			style={{
				position: "fixed",
				right: "1rem",
				top: "50%",
				transform: "translateY(-50%)",
				zIndex: 100,
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
				height: "50vh",
				justifyContent: "space-between",
			}}>
			{sections.map((section) => (
				<motion.a
					key={section.id}
					href={`#${section.id}`}
					className="section-indicator"
					onClick={(e) => {
						e.preventDefault();
						if (section.id === "hero") {
							window.scrollTo({
								top: 0,
								behavior: "smooth",
							});
						} else {
							document.getElementById(section.id)?.scrollIntoView({
								behavior: "smooth",
							});
						}
					}}
					style={{
						margin: `${3}vh 0`,
						padding: "1rem 0.2rem",
						fontSize: "0.875rem",
						color: activeSection === section.id ? "#0070f3" : "#666",
						transition: "all 0.3s ease",
						cursor: "pointer",
						textTransform: "uppercase",
						letterSpacing: "0.0625rem",
						transform: "rotate(-90deg)",
						transformOrigin: "right center",
						whiteSpace: "nowrap",
						textDecoration: "none",
					}}
					aria-label={section.ariaLabel}
					role="link">
					{section.name}
				</motion.a>
			))}
			<motion.div
				className="progress-line"
				style={{
					position: "absolute",
					left: "3rem",
					top: 0,
					width: "0.125rem",
					height: "100%",
					backgroundColor: "#0070f3",
					transformOrigin: "top",
					scaleY: scrollYProgress,
				}}
			/>
		</motion.div>
	);
}
