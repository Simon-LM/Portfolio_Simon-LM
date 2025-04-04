/** @format */

import { useState, useEffect } from "react";

// Types disponibles de tailles de police
export type FontSizeType = "normal" | "large" | "x-large";

/**
 * Hook pour gérer la taille de police avec persistance des préférences
 */
export const useFontSize = () => {
	// État pour la taille de police active
	const [fontSize, setFontSizeState] = useState<FontSizeType>("normal");
	// État pour vérifier si le composant est monté (côté client)
	const [mounted, setMounted] = useState(false);

	// Valeurs numériques correspondant à chaque taille (pourcentage)
	const fontSizeValues = {
		normal: 100,
		large: 125,
		"x-large": 150,
	};

	// Effet pour initialiser la taille de police au chargement
	useEffect(() => {
		if (typeof window !== "undefined") {
			setMounted(true);

			// Récupérer la taille de police du localStorage
			const savedFontSize = localStorage.getItem(
				"dmpa-font-size"
			) as FontSizeType | null;

			if (
				savedFontSize &&
				["normal", "large", "x-large"].includes(savedFontSize)
			) {
				setFontSizeState(savedFontSize);
			}
		}
	}, []);

	// Appliquer la taille de police quand elle change
	useEffect(() => {
		if (mounted) {
			// Stocker la préférence
			localStorage.setItem("dmpa-font-size", fontSize);

			// Appliquer la taille via une variable CSS
			document.documentElement.style.setProperty(
				"--dmpa-font-size-factor",
				`${fontSizeValues[fontSize] / 100}`
			);

			// Ajouter des classes pour des styles plus spécifiques
			const root = document.documentElement;
			root.classList.remove(
				"dmpa-font-normal",
				"dmpa-font-large",
				"dmpa-font-x-large"
			);
			root.classList.add(`dmpa-font-${fontSize}`);

			// Définir un attribut pour le styling CSS
			document.documentElement.setAttribute("data-dmpa-font-size", fontSize);
		}
	}, [fontSize, mounted, fontSizeValues]);

	// Fonctions utilitaires pour modifier la taille
	const increaseFontSize = () => {
		setFontSizeState((current) => {
			if (current === "normal") return "large";
			if (current === "large") return "x-large";
			return current;
		});
	};

	const decreaseFontSize = () => {
		setFontSizeState((current) => {
			if (current === "x-large") return "large";
			if (current === "large") return "normal";
			return current;
		});
	};

	const resetFontSize = () => {
		setFontSizeState("normal");
	};

	// Fonction pour définir directement la taille
	const setFontSize = (newFontSize: FontSizeType) => {
		setFontSizeState(newFontSize);
	};

	// Accesseurs pratiques pour vérifier la taille actuelle
	const isNormal = fontSize === "normal";
	const isLarge = fontSize === "large";
	const isXLarge = fontSize === "x-large";

	return {
		fontSize,
		setFontSize,
		increaseFontSize,
		decreaseFontSize,
		resetFontSize,
		isNormal,
		isLarge,
		isXLarge,
		mounted,
		fontSizePercentage: fontSizeValues[fontSize],
	};
};
