/** @format */

import { useState, useEffect } from "react";

// Types de polices supportées pour les personnes dyslexiques
export type DyslexicFontType =
	| "none"
	| "opendyslexic"
	| "sylexiad"
	| "sylexiad-serif"
	| "atkinson"
	| "andika";

/**
 * Hook pour gérer les polices adaptées aux personnes dyslexiques
 */
export const useDyslexicFont = () => {
	// État pour le type de police active
	const [fontType, setFontTypeState] = useState<DyslexicFontType>("none");
	// État pour vérifier si le composant est monté (côté client)
	const [mounted, setMounted] = useState(false);

	// Effet pour initialiser le type de police au chargement
	useEffect(() => {
		if (typeof window !== "undefined") {
			setMounted(true);

			// Récupérer le type de police du localStorage
			const savedFontType = localStorage.getItem(
				"dmpa-dyslexic-font"
			) as DyslexicFontType | null;

			if (
				savedFontType &&
				[
					"none",
					"opendyslexic",
					"sylexiad",
					"sylexiad-serif",
					"atkinson",
					"andika",
				].includes(savedFontType)
			) {
				setFontTypeState(savedFontType);
			}
		}
	}, []);

	// Appliquer le type de police quand il change
	useEffect(() => {
		if (mounted) {
			// Stocker la préférence
			localStorage.setItem("dmpa-dyslexic-font", fontType);

			// Retirer toutes les classes de police
			const root = document.documentElement;
			root.classList.remove(
				"dmpa-font-opendyslexic",
				"dmpa-font-sylexiad",
				"dmpa-font-sylexiad-serif",
				"dmpa-font-atkinson",
				"dmpa-font-andika"
			);

			// Ajouter la classe appropriée si nécessaire
			if (fontType !== "none") {
				root.classList.add(`dmpa-font-${fontType}`);
			}

			// Définir un attribut pour le styling CSS
			document.documentElement.setAttribute(
				"data-dmpa-dyslexic-font",
				fontType
			);
		}
	}, [fontType, mounted]);

	// Fonction pour changer le type de police
	const setFontType = (newFontType: DyslexicFontType) => {
		setFontTypeState(newFontType);
	};

	// Accesseurs pratiques
	const isStandard = fontType === "none";
	const isOpenDyslexic = fontType === "opendyslexic";
	const isSylexiad = fontType === "sylexiad";
	const isSylexiadSerif = fontType === "sylexiad-serif";
	const isAtkinson = fontType === "atkinson";
	const isAndika = fontType === "andika";

	return {
		fontType,
		setFontType,
		isStandard,
		isOpenDyslexic,
		isSylexiad,
		isSylexiadSerif,
		isAtkinson,
		isAndika,
		mounted,
	};
};
