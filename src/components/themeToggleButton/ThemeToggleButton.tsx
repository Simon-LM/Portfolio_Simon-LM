/** @format */

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";

type ThemeKey =
	| "light"
	| "dark"
	| "high-contrast"
	| "deuteranomaly"
	| "deuteranopia"
	| "protanomaly"
	| "protanopia"
	| "tritanomaly"
	| "tritanopia";

const themes = {
	light: "light" as ThemeKey,
	dark: "dark" as ThemeKey,
	highContrast: "high-contrast" as ThemeKey,
	deuteranomaly: "deuteranomaly" as ThemeKey,
	deuteranopia: "deuteranopia" as ThemeKey,
	protanomaly: "protanomaly" as ThemeKey,
	protanopia: "protanopia" as ThemeKey,
	tritanomaly: "tritanomaly" as ThemeKey,
	tritanopia: "tritanopia" as ThemeKey,
};

export default function ThemeToggleButton({
	language,
}: {
	language: "fr" | "en";
}) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	// const handleThemeChange = (themeKey: string) => {
	// 	setTheme(themeKey as any);
	// };

	const handleThemeChange = (theme: ThemeKey) => {
		document.documentElement.classList.add("theme-switching");
		setTimeout(() => {
			document.documentElement.classList.remove("theme-switching");
			document.documentElement.setAttribute("data-theme", theme);
		}, 0);
		setTheme(theme);
	};

	if (!mounted) {
		return <div className="theme-toggle skeleton"></div>;
	}

	const getThemeLabel = (themeKey: ThemeKey, lang: "fr" | "en"): string => {
		const labels: Record<ThemeKey, { fr: string; en: string }> = {
			light: { fr: "Clair", en: "Light" },
			dark: { fr: "Sombre", en: "Dark" },
			"high-contrast": { fr: "Contraste", en: "Contrast" },
			deuteranomaly: { fr: "Deutéranomalie", en: "Deuteranomaly" },
			deuteranopia: { fr: "Deutéranopie", en: "Deuteranopia" },
			protanomaly: { fr: "Protanomalie", en: "Protanomaly" },
			protanopia: { fr: "Protanopie", en: "Protanopia" },
			tritanomaly: { fr: "Tritanomalie", en: "Tritanomaly" },
			tritanopia: { fr: "Tritanopie", en: "Tritanopia" },
		};

		return labels[themeKey]?.[language] || themeKey;
	};

	return (
		<div className="theme-toggle">
			{Object.entries(themes).map(([themeKey, themeValue]) => (
				<button
					key={themeKey}
					onClick={() => handleThemeChange(themeValue)}
					aria-label={
						language === "fr"
							? `Thème ${getThemeLabel(themeValue, "fr")}`
							: `${getThemeLabel(themeValue, "en")} theme`
					}
					aria-pressed={theme === themeValue}
					className={`theme-toggle__button ${
						theme === themeValue ? "active" : ""
					}`}>
					{getThemeLabel(themeValue, language)}
				</button>
			))}
		</div>
	);
}
