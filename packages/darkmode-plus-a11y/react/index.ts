/** @format */

// React runtime entry point of the package: theme list, hooks, and the
// anti-FOUC script generator.
export { THEMES, type ThemeOption } from "./themes";
export { useTheme } from "./useTheme";
export { usePrefersDarkMode } from "./usePrefersDarkMode";
export { themeInitScript } from "./themeInitScript";
export { usePreference, type UsePreferenceOptions } from "./usePreference";
export {
	detectAvailableThemes,
	resolveColorVisionModes,
	COLOR_VISION_TYPES,
	type ColorVisionType,
	type ColorVisionModesOption,
} from "./detectThemes";
export {
	applyFontSizeFactor,
	applyAccessibilityFont,
	applyReduceMotion,
} from "./appliers";
