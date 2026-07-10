/** @format */

// Default theme list of the package (the 15 accessible themes) — single
// source of truth for the runtime. NOTE: the SCSS [data-theme] blocks
// (consumer-side, src/styles/abstracts/_theme-system.scss in the
// portfolio) must stay in sync manually until theme-list generation is
// extracted too (see GUIDE-extraction-paquet.md).
// high-contrast* : « high-contrast » = jaune sur noir (valeur historique,
// conservée pour les localStorage existants) + 3 variantes (chantier HC).
export const THEMES = [
	"light",
	"dark",
	"anti-glare-light",
	"anti-glare-dark",
	"high-contrast",
	"high-contrast-green",
	"high-contrast-white",
	"high-contrast-paper",
	"deuteranomaly",
	"deuteranopia",
	"protanomaly",
	"protanopia",
	"tritanomaly",
	"tritanopia",
	"achromatopsia",
] as const;

export type ThemeOption = (typeof THEMES)[number];
