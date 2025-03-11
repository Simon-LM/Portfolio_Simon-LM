/** @format */

import { useState, useEffect } from "react";

type ThemeOption =
	| "light"
	| "dark"
	| "high-contrast"
	| "deuteranomaly"
	| "deuteranopia"
	| "protanomaly"
	| "protanopia"
	| "tritanomaly"
	| "tritanopia";

export function useTheme() {
	// État local pour le thème actuel
	const [theme, setThemeState] = useState<ThemeOption>("light");

	// Fonction pour définir le thème
	const setTheme = (newTheme: ThemeOption) => {
		if (typeof document !== "undefined") {
			// ===== DÉBUT DES MODIFICATIONS =====

			// 1. Appliquer le nouveau thème à l'élément racine
			document.documentElement.setAttribute("data-theme", newTheme);

			// 2. Forcer un reflow pour rafraîchir les styles
			void document.documentElement.offsetWidth;
			void document.documentElement.offsetHeight;

			// 3. Ajouter temporairement puis supprimer une classe pour forcer un recalcul complet
			document.documentElement.classList.add("theme-switching");

			// 4. Timeout pour permettre au navigateur de traiter les changements
			setTimeout(() => {
				document.documentElement.classList.remove("theme-switching");

				// 5. Log pour débogage
				console.log("Thème appliqué:", newTheme);
				console.log(
					"Variable CSS test (section-bg-odd):",
					getComputedStyle(document.documentElement)
						.getPropertyValue("--color-section-bg-odd")
						.trim()
				);
				console.log(
					"Variable CSS test (main-bg):",
					getComputedStyle(document.documentElement)
						.getPropertyValue("--color-main-bg")
						.trim()
				);
			}, 10);

			// ===== FIN DES MODIFICATIONS =====

			// document.documentElement.setAttribute("data-theme", newTheme);
			localStorage.setItem("theme", newTheme);
			setThemeState(newTheme);
		}
	};

	// Initialisation au montage du composant
	useEffect(() => {
		// Récupérer le thème du localStorage ou utiliser les préférences système
		const savedTheme = localStorage.getItem("theme") as ThemeOption | null;

		if (
			savedTheme &&
			[
				"light",
				"dark",
				"high-contrast",
				"deuteranomaly",
				"deuteranopia",
				"protanomaly",
				"protanopia",
				"tritanomaly",
				"tritanopia",
			].includes(savedTheme)
		) {
			setTheme(savedTheme);
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setTheme("dark");
		} else {
			setTheme("light");
		}

		// Observer les changements d'attribut data-theme (utile si modifié ailleurs)
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === "data-theme") {
					const newTheme = document.documentElement.getAttribute(
						"data-theme"
					) as ThemeOption;
					if (newTheme) setThemeState(newTheme);
				}
			});
		});

		observer.observe(document.documentElement, { attributes: true });

		return () => observer.disconnect();
	}, []);

	return {
		theme, // Thème actuel
		setTheme, // Fonction pour changer de thème
		isLight: theme === "light",
		isDark: theme === "dark",
		isHighContrast: theme === "high-contrast",
		isDeuteranomaly: theme === "deuteranomaly",
		isDeuteranopia: theme === "deuteranopia",
		isProtanomaly: theme === "protanomaly",
		isProtanopia: theme === "protanopia",
		isTritanomaly: theme === "tritanomaly",
		isTritanopia: theme === "tritanopia",
	};
}
