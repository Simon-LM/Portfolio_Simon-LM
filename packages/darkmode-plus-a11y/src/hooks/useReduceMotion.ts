/** @format */

import { useState, useEffect } from "react";

/**
 * Hook pour gérer la réduction des animations
 */
export const useReduceMotion = () => {
	// État pour la réduction des animations
	const [reduceMotion, setReduceMotionState] = useState(false);
	// État pour vérifier si le composant est monté (côté client)
	const [mounted, setMounted] = useState(false);

	// Effet pour initialiser au chargement
	useEffect(() => {
		if (typeof window !== "undefined") {
			setMounted(true);

			// Vérifier les préférences système
			const prefersReducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;

			// Récupérer la préférence depuis localStorage ou utiliser les préférences système
			const savedPreference = localStorage.getItem("dmpa-reduce-motion");
			if (savedPreference !== null) {
				setReduceMotionState(savedPreference === "true");
			} else {
				setReduceMotionState(prefersReducedMotion);
			}

			// Observer les changements de préférences système
			const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
			const handleMediaChange = (e: MediaQueryListEvent) => {
				if (localStorage.getItem("dmpa-reduce-motion") === null) {
					setReduceMotionState(e.matches);
				}
			};

			// Ajouter l'écouteur d'événement
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener("change", handleMediaChange);
			} else if (mediaQuery.addListener) {
				// Pour la compatibilité avec les navigateurs plus anciens
				mediaQuery.addListener(handleMediaChange);
			}

			// Nettoyage
			return () => {
				if (mediaQuery.removeEventListener) {
					mediaQuery.removeEventListener("change", handleMediaChange);
				} else if (mediaQuery.removeListener) {
					mediaQuery.removeListener(handleMediaChange);
				}
			};
		}
	}, []);

	// Appliquer la préférence quand elle change
	useEffect(() => {
		if (mounted) {
			// Stocker la préférence
			localStorage.setItem("dmpa-reduce-motion", reduceMotion.toString());

			// Appliquer la préférence via une classe CSS
			const root = document.documentElement;
			if (reduceMotion) {
				root.classList.add("dmpa-reduce-motion");
			} else {
				root.classList.remove("dmpa-reduce-motion");
			}

			// Définir un attribut pour le styling CSS
			document.documentElement.setAttribute(
				"data-dmpa-reduce-motion",
				reduceMotion.toString()
			);
		}
	}, [reduceMotion, mounted]);

	// Fonction pour basculer la réduction des animations
	const toggleReduceMotion = () => {
		setReduceMotionState((prev) => !prev);
	};

	// Fonction pour définir directement la valeur
	const setReduceMotion = (value: boolean) => {
		setReduceMotionState(value);
	};

	return {
		reduceMotion,
		toggleReduceMotion,
		setReduceMotion,
		mounted,
	};
};
