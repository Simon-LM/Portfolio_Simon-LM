/** @format */

"use client";

// Accessibility trigger (scaffolded template — you own it, edit freely):
// a button that opens the accessibility card.
//
// ⚠️ PLACEMENT: this component is meant to be placed IN THE PAGE FLOW
// (typically in your header), NOT as a floating `position: fixed` — a
// floating button overlaps content at high zoom (an accessibility defect).
// Render it wherever you want: <AccessibilityControl … />.

import { useState, useRef, useEffect, type ReactNode } from "react";
import { FaUniversalAccess } from "react-icons/fa";
import AccessibilityMenu from "./AccessibilityMenu";

interface AccessibilityControlProps {
	language: "fr" | "en";
	/** Corner the panel opens toward. */
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	className?: string;
	/** Button icon (default: universal accessibility icon). */
	icon?: ReactNode;
	/** Link to your accessibility statement (optional). */
	complianceUrl?: string;
}

export default function AccessibilityControl({
	language,
	position = "top-right",
	className = "",
	icon,
	complianceUrl,
}: AccessibilityControlProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Close on outside click.
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Close on Escape, returning focus to the button.
	useEffect(() => {
		function handleEscapeKey(event: KeyboardEvent) {
			if (event.key === "Escape" && menuOpen) {
				setMenuOpen(false);
				buttonRef.current?.focus();
			}
		}
		document.addEventListener("keydown", handleEscapeKey);
		return () => document.removeEventListener("keydown", handleEscapeKey);
	}, [menuOpen]);

	const handleCloseMenu = () => {
		setMenuOpen(false);
		buttonRef.current?.focus();
	};

	const accessibilityText =
		language === "fr" ? "Options d'accessibilité" : "Accessibility options";

	return (
		<div className={`accessibility-control ${position} ${className}`} ref={menuRef}>
			<button
				className="accessibility-control__button"
				onClick={() => setMenuOpen((open) => !open)}
				aria-expanded={menuOpen}
				aria-label={accessibilityText}
				data-tooltip={accessibilityText}
				ref={buttonRef}>
				<span className="accessibility-control__icon" aria-hidden="true">
					{icon ?? <FaUniversalAccess size={24} />}
				</span>
			</button>

			<div className={`accessibility-panel ${menuOpen ? "open" : ""}`}>
				<AccessibilityMenu
					language={language}
					onClose={handleCloseMenu}
					complianceUrl={complianceUrl}
				/>
			</div>
		</div>
	);
}
