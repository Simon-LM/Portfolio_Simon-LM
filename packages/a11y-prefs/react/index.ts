/** @format */

// Point d'entrée runtime React du paquet (E4) : liste des thèmes, hooks
// et générateur du script anti-FOUC (phase 3).
export { THEMES, type ThemeOption } from "./themes";
export { useTheme } from "./useTheme";
export { usePrefersDarkMode } from "./usePrefersDarkMode";
export { themeInitScript } from "./themeInitScript";
export { usePreference, type UsePreferenceOptions } from "./usePreference";
export {
	applyFontSizeFactor,
	applyAccessibilityFont,
	applyReduceMotion,
} from "./appliers";
