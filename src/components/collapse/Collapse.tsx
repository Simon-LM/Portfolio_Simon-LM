/** @format */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapseProps {
	title: string;
	children: React.ReactNode;
	id?: string;
	headingLevel?: "h2" | "h3" | "h4";
}

// export default function Collapse({ title, children, id }: CollapseProps) {
// 	const [isOpen, setIsOpen] = useState(false);

// 	return (
// 		<div className="collapse" id={id}>
// 			<button
// 				className="collapse__trigger"
// 				onClick={() => setIsOpen(!isOpen)}
// 				aria-expanded={isOpen}
// 				aria-controls={`content-${title}`}>
// 				<h2 className="collapse__title">{title}</h2>
// 				<motion.span
// 					animate={{ rotate: isOpen ? 180 : 0 }}
// 					className="collapse__icon">
// 					▼
// 				</motion.span>
// 			</button>
// 			<AnimatePresence>
// 				{isOpen && (
// 					<motion.div
// 						id={`content-${title}`}
// 						initial={{ height: 0, opacity: 0 }}
// 						animate={{ height: "auto", opacity: 1 }}
// 						exit={{ height: 0, opacity: 0 }}
// 						className="collapse__content">
// 						{children}
// 					</motion.div>
// 				)}
// 			</AnimatePresence>
// 		</div>
// 	);
// }
export default function Collapse({
	title,
	children,
	id,
	headingLevel = "h2",
}: CollapseProps) {
	const [isOpen, setIsOpen] = useState(false);
	const HeadingTag = headingLevel;

	return (
		<div className="collapse" id={id}>
			<button
				className="collapse__trigger"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				aria-controls={`content-${title}`}>
				<HeadingTag className="collapse__title">{title}</HeadingTag>
				<motion.span
					animate={{ rotate: isOpen ? 180 : 0 }}
					className="collapse__icon">
					▼
				</motion.span>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						id={`content-${title}`}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="collapse__content">
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
