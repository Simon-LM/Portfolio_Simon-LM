/** @format */
"use client";

import { useState, useEffect } from "react";

/**
 * Hook qui détecte la préférence système pour le mode sombre
 * @returns boolean - true si l'utilisateur préfère le mode sombre
 */
export function usePrefersDarkMode(): boolean {
	const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(false);

	useEffect(() => {
		// Vérifier la préférence initiale
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		setPrefersDarkMode(mediaQuery.matches);

		// Écouter les changements de préférence
		const handleChange = (event: MediaQueryListEvent) => {
			setPrefersDarkMode(event.matches);
		};

		mediaQuery.addEventListener("change", handleChange);

		// Cleanup
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return prefersDarkMode;
}
