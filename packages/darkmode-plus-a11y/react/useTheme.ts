/** @format */
"use client";

import { useState, useEffect } from "react";
import { THEMES, ThemeOption } from "./themes";

// Read initial theme from localStorage or system preference.
// Called as a lazy useState initializer — runs on server (returns "light") and on client.
// `themes` narrows validation (default: the package's 15).
function getInitialTheme(themes: readonly string[]): ThemeOption {
	if (typeof window === "undefined") return "light"; // SSR default
	const savedTheme = localStorage.getItem("theme") as ThemeOption | null;
	if (savedTheme && themes.includes(savedTheme)) return savedTheme;
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
	return "light";
}

export function useTheme(themes: readonly string[] = THEMES) {
	// Lazy initializer reads from localStorage/matchMedia — no setState in any effect
	const [theme, setThemeState] = useState<ThemeOption>(() =>
		getInitialTheme(themes),
	);

	// Function to set the theme
	const setTheme = (newTheme: ThemeOption) => {
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute("data-theme", newTheme);
			localStorage.setItem("theme", newTheme);
			setThemeState(newTheme);
		}
	};

	// Apply initial theme to DOM and subscribe to external data-theme mutations.
	// No setState in the effect body — setThemeState is called only in the observer callback.
	useEffect(() => {
		if (typeof document === "undefined") return;

		// Apply the theme determined by the lazy initializer to the DOM attribute
		document.documentElement.setAttribute("data-theme", getInitialTheme(themes));

		// Observe data-theme attribute changes (useful if modified elsewhere)
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === "data-theme") {
					const newTheme = document.documentElement.getAttribute(
						"data-theme",
					) as ThemeOption;
					// setState is called inside a callback, not in the effect body — allowed
					if (newTheme && themes.includes(newTheme)) setThemeState(newTheme);
				}
			});
		});

		observer.observe(document.documentElement, { attributes: true });

		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		theme, // Current theme
		setTheme, // Function to change the theme
		isLight: theme === "light",
		isDark: theme === "dark",
		isAntiGlareLight: theme === "anti-glare-light",
		isAntiGlareDark: theme === "anti-glare-dark",
		isHighContrast: theme === "high-contrast",
		isDeuteranomaly: theme === "deuteranomaly",
		isDeuteranopia: theme === "deuteranopia",
		isProtanomaly: theme === "protanomaly",
		isProtanopia: theme === "protanopia",
		isTritanomaly: theme === "tritanomaly",
		isTritanopia: theme === "tritanopia",
		isAchromatopsia: theme === "achromatopsia",
	};
}
