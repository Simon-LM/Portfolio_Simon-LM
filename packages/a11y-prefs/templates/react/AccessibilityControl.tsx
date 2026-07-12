/** @format */

"use client";

// Déclencheur d'accessibilité (template scaffoldé — vous le possédez,
// modifiez-le librement) : un bouton qui ouvre la carte d'accessibilité.
//
// ⚠️ PLACEMENT : ce composant est prévu pour être posé DANS LE FLUX de la
// page (typiquement dans votre header), PAS en `position: fixed` flottant —
// un bouton flottant chevauche le contenu aux grands zooms (faute
// d'accessibilité). Rendez-le où vous voulez : <AccessibilityControl … />.

import { useState, useRef, useEffect, type ReactNode } from "react";
import { FaUniversalAccess } from "react-icons/fa";
import AccessibilityMenu from "./AccessibilityMenu";

interface AccessibilityControlProps {
	language: "fr" | "en";
	/** Coin vers lequel le panneau s'ouvre. */
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	className?: string;
	/** Icône du bouton (défaut : icône d'accessibilité universelle). */
	icon?: ReactNode;
	/** Lien vers votre déclaration d'accessibilité (optionnel). */
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

	// Fermer au clic extérieur.
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fermer à Échap, en rendant le focus au bouton.
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
