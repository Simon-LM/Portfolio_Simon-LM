/** @format */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useCursorNavigation } from "../../hooks/useCursorNavigation";

interface CollapseProps {
	title: string;
	children: React.ReactNode;
	id?: string;
	headingLevel?: "h2" | "h3" | "h4";
}

export default function Collapse({
	title,
	children,
	id,
	headingLevel = "h2",
}: CollapseProps) {
	const [isOpen, setIsOpen] = useState(false);
	const HeadingTag = headingLevel;
	const headerId = `heading-${id || title}`;
	const contentId = `content-${id || title}`;
	const isCursorNavigationEnabled = useCursorNavigation();

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (isCursorNavigationEnabled) {
			return;
		}

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const buttons = document.querySelectorAll(".collapse__trigger");
			const currentIndex = Array.from(buttons).indexOf(
				event.target as HTMLElement
			);
			const nextIndex =
				event.key === "ArrowDown"
					? (currentIndex + 1) % buttons.length
					: (currentIndex - 1 + buttons.length) % buttons.length;
			(buttons[nextIndex] as HTMLElement).focus();
		}
	};

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscapeKey);
		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isOpen]);

	return (
		<div className="collapse" id={id}>
			<button
				id={headerId}
				className="collapse__trigger"
				onClick={() => setIsOpen(!isOpen)}
				onKeyDown={handleKeyDown}
				aria-expanded={isOpen}
				aria-controls={contentId}>
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
						id={contentId}
						className="collapse__content"
						role="region"
						aria-labelledby={headerId}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
