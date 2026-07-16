/** @format */

// Default theme list of the package (the 15 accessible themes) — single
// source of truth for the runtime. NOTE: the SCSS [data-theme] blocks
// (consumer-side, src/styles/abstracts/_theme-system.scss in the
// portfolio) must stay in sync manually until theme-list generation is
// extracted too (see GUIDE-package-extraction.md).
// high-contrast*: "high-contrast" = yellow on black (historical value,
// kept for existing localStorage entries) + 3 variants (HC chantier).
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
