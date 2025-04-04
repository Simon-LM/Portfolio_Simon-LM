/** @format */

import { useState, useRef, useEffect } from "react";
import { A11yMenu } from "../components/A11yMenu";

import accessibilityIconAvif from "../assets/Icon_Accessibility_Contrasts-Visuals.avif";
import accessibilityIconWebp from "../assets/Icon_Accessibility_Contrasts-Visuals.webp";
import accessibilityIconPng from "../assets/Icon_Accessibility_Contrasts-Visuals.png";

// Interface pour clarifier le type StaticImageData
interface StaticImageData {
	src: string;
	height: number;
	width: number;
	blurDataURL?: string;
}

/**
 * Fonction utilitaire pour extraire l'URL src d'une image
 * Gère à la fois les chaînes de caractères et les objets StaticImageData
 */
function getImageSrc(imageImport: string | StaticImageData): string {
	if (
		typeof imageImport === "object" &&
		imageImport !== null &&
		"src" in imageImport
	) {
		return imageImport.src;
	}
	return imageImport as string;
}

interface A11yControlProps {
	language: "fr" | "en" | "es";
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
	className?: string;
	customIcon?: React.ReactNode;
	// Ajout d'une option pour désactiver l'icône par défaut
	useDefaultIcon?: boolean;
}

export const A11yControl = ({
	language,
	position = "top-right",
	className = "",
	customIcon,
	useDefaultIcon = true,
}: A11yControlProps) => {
	const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Fermer le menu quand on clique ailleurs
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

	const toggleAccessibilityMenu = () => {
		setAccessibilityMenuOpen(!accessibilityMenuOpen);
	};

	const accessibilityText =
		language === "fr"
			? "Options d'accessibilité"
			: language === "es"
			? "Opciones de accesibilidad"
			: "Accessibility options";

	// Fonction pour rendre l'icône par défaut
	const renderDefaultIcon = () => {
		if (typeof Image === "undefined") {
			// Fallback SVG si nous ne sommes pas dans un environnement avec Next/Image
			return (
				<div className="dmpa-control__icon">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round">
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4"></path>
						<path d="M12 8h.01"></path>
					</svg>
				</div>
			);
		}

		// Utilisation de l'image optimisée si possible
		try {
			// Importation dynamique de Next/Image pour éviter les erreurs
			const NextImage = require("next/image").default;

			// Utilisation de notre fonction utilitaire pour obtenir les URLs
			const avifSrc = getImageSrc(accessibilityIconAvif);
			const webpSrc = getImageSrc(accessibilityIconWebp);
			const pngSrc = getImageSrc(accessibilityIconPng);

			return (
				<picture className="dmpa-control__icon">
					<source srcSet={avifSrc} type="image/avif" />
					<source srcSet={webpSrc} type="image/webp" />
					<NextImage
						src={pngSrc}
						alt=""
						width={24}
						height={24}
						priority
						aria-hidden="true"
					/>
				</picture>
			);
		} catch (e) {
			// Fallback si Next/Image n'est pas disponible
			// Utilisation de notre fonction utilitaire pour obtenir les URLs
			const avifSrc = getImageSrc(accessibilityIconAvif);
			const webpSrc = getImageSrc(accessibilityIconWebp);
			const pngSrc = getImageSrc(accessibilityIconPng);

			return (
				<picture className="dmpa-control__icon">
					<source srcSet={avifSrc} type="image/avif" />
					<source srcSet={webpSrc} type="image/webp" />
					<img src={pngSrc} alt="" width="24" height="24" />
				</picture>
			);
		}
	};

	return (
		<div className={`dmpa-control ${position} ${className}`} ref={menuRef}>
			<button
				className="dmpa-control__button"
				onClick={toggleAccessibilityMenu}
				aria-expanded={accessibilityMenuOpen}
				aria-label={accessibilityText}
				data-tooltip={accessibilityText}>
				{customIcon ? customIcon : renderDefaultIcon()}
			</button>

			{accessibilityMenuOpen && (
				<div className="dmpa-panel">
					<A11yMenu language={language} />
				</div>
			)}
		</div>
	);
};
