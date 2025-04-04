/** @format */

// Composants principaux
export { A11yControl } from "./components/A11yControl";
export { A11yMenu } from "./components/A11yMenu";

// Hooks
export { useTheme, type ThemeType } from "./hooks/useTheme";
export { useFontSize, type FontSizeType } from "./hooks/useFontSize";
export {
	useDyslexicFont,
	type DyslexicFontType,
} from "./hooks/useDyslexicFont";
export { useReduceMotion } from "./hooks/useReduceMotion";
export {
	useTranslations,
	type CustomTranslations,
} from "./hooks/useTranslations";

// Traductions
export { translations, getTranslation } from "./translations";
