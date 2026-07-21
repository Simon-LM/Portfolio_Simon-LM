/** @format */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import AccessibilityMenu from "../../components/accessibilityMenu/AccessibilityMenu";

import accessibilityIconSvg from "../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.svg";

interface AccessibilityControlProps {
	language: "fr" | "en";
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	className?: string;
}

export default function AccessibilityControl({
	language,
	position = "top-right",
	className = "",
}: AccessibilityControlProps) {
	const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Close the menu when clicking elsewhere
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setAccessibilityMenuOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuRef]);

	useEffect(() => {
		function handleEscapeKey(event: KeyboardEvent) {
			if (event.key === "Escape" && accessibilityMenuOpen) {
				setAccessibilityMenuOpen(false);
				buttonRef.current?.focus(); // Return focus to the button
			}
		}

		document.addEventListener("keydown", handleEscapeKey);
		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [accessibilityMenuOpen]);

	const handleCloseMenu = () => {
		setAccessibilityMenuOpen(false);
		buttonRef.current?.focus();
	};

	const toggleAccessibilityMenu = () => {
		setAccessibilityMenuOpen(!accessibilityMenuOpen);
	};

	const accessibilityText =
		language === "fr" ? "Options d'accessibilité" : "Accessibility options";

	return (
		<div
			className={`accessibility-control ${position} ${className}`}
			ref={menuRef}>
			<button
				className="accessibility-control__button"
				onClick={toggleAccessibilityMenu}
				aria-expanded={accessibilityMenuOpen}
				aria-label={accessibilityText}
				data-tooltip={accessibilityText}
				ref={buttonRef}>
				<span className="accessibility-control__icon">
					<Image
						src={accessibilityIconSvg.src}
						alt=""
						width={24}
						height={24}
						loading="eager"
						priority
						aria-hidden="true"
					/>
				</span>
			</button>

			<div
				className={`accessibility-panel ${
					accessibilityMenuOpen ? "open" : ""
				}`}>
				<AccessibilityMenu language={language} onClose={handleCloseMenu} />
				{/* <AccessibilityMenu language={language} /> */}
			</div>
		</div>
	);
}
