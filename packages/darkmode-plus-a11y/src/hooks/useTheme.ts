/** @format */

import { useState, useEffect } from "react";

// Types des thèmes supportés
export type ThemeType =
	| "light"
	| "dark"
	| "high-contrast"
	| "anti-glare-light"
	| "anti-glare-dark";

/**
 * Hook pour gérer le thème avec stockage des préférences
 * et détection des préférences système
 */
export const useTheme = () => {
	// État pour le thème actif
	const [theme, setThemeState] = useState<ThemeType>("light");
	// État pour vérifier si le composant est monté (côté client)
	const [mounted, setMounted] = useState(false);

	// Effet pour initialiser le thème au chargement
	useEffect(() => {
		if (typeof window !== "undefined") {
			setMounted(true);

			// Récupérer le thème du localStorage ou utiliser les préférences système
			const savedTheme = localStorage.getItem("dmpa-theme") as ThemeType | null;

			if (
				savedTheme &&
				[
					"light",
					"dark",
					"high-contrast",
					"anti-glare-light",
					"anti-glare-dark",
				].includes(savedTheme)
			) {
				setThemeState(savedTheme);
			} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				setThemeState("dark");
			} else {
				setThemeState("light");
			}

			// Observer les préférences système si elles changent
			const darkModeMediaQuery = window.matchMedia(
				"(prefers-color-scheme: dark)"
			);
			const handleMediaChange = (e: MediaQueryListEvent) => {
				if (!localStorage.getItem("dmpa-theme")) {
					setThemeState(e.matches ? "dark" : "light");
				}
			};

			// Ajouter l'écouteur d'événement avec vérification de compatibilité
			if (darkModeMediaQuery.addEventListener) {
				darkModeMediaQuery.addEventListener("change", handleMediaChange);
			} else if (darkModeMediaQuery.addListener) {
				// Pour la compatibilité avec les navigateurs plus anciens
				darkModeMediaQuery.addListener(handleMediaChange);
			}

			// Nettoyage
			return () => {
				if (darkModeMediaQuery.removeEventListener) {
					darkModeMediaQuery.removeEventListener("change", handleMediaChange);
				} else if (darkModeMediaQuery.removeListener) {
					darkModeMediaQuery.removeListener(handleMediaChange);
				}
			};
		}
	}, []);

	// Appliquer le thème quand il change
	useEffect(() => {
		if (mounted) {
			document.documentElement.setAttribute("data-dmpa-theme", theme);
			localStorage.setItem("dmpa-theme", theme);

			// Applique également des classes pour des styles CSS plus spécifiques
			const root = document.documentElement;
			root.classList.remove(
				"dmpa-theme-light",
				"dmpa-theme-dark",
				"dmpa-theme-high-contrast",
				"dmpa-theme-anti-glare-light",
				"dmpa-theme-anti-glare-dark"
			);
			root.classList.add(`dmpa-theme-${theme}`);
		}
	}, [theme, mounted]);

	// Fonction pour changer de thème
	const setTheme = (newTheme: ThemeType) => {
		setThemeState(newTheme);
	};

	// Accesseurs pratiques pour vérifier le thème actuel
	const isLight = theme === "light";
	const isDark = theme === "dark";
	const isHighContrast = theme === "high-contrast";
	const isAntiGlareLight = theme === "anti-glare-light";
	const isAntiGlareDark = theme === "anti-glare-dark";

	return {
		theme,
		setTheme,
		isLight,
		isDark,
		isHighContrast,
		isAntiGlareLight,
		isAntiGlareDark,
		mounted,
	};
};
