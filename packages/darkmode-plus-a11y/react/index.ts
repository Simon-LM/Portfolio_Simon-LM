/** @format */

// React runtime entry point of the package (E4): theme list, hooks,
// and the anti-FOUC script generator (phase 3).
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
