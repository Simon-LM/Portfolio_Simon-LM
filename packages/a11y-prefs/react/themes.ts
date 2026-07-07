/** @format */

// Default theme list of the package (the 12 accessible themes) — single
// source of truth for the runtime. NOTE: the SCSS [data-theme] blocks
// (consumer-side, src/styles/abstracts/_theme-system.scss in the
// portfolio) must stay in sync manually until theme-list generation is
// extracted too (see GUIDE-extraction-paquet.md).
export const THEMES = [
	"light",
	"dark",
	"anti-glare-light",
	"anti-glare-dark",
	"high-contrast",
	"deuteranomaly",
	"deuteranopia",
	"protanomaly",
	"protanopia",
	"tritanomaly",
	"tritanopia",
	"achromatopsia",
] as const;

export type ThemeOption = (typeof THEMES)[number];
