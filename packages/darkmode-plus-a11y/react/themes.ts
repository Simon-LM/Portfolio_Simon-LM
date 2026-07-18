/** @format */

// Default theme list of the package (the 15 accessible themes) — single
// source of truth for the runtime. NOTE: your own SCSS [data-theme]
// blocks must stay in sync with this list manually — nothing generates
// them from here.
// high-contrast*: "high-contrast" = yellow on black (kept for backward
// compatibility with existing localStorage entries) + 3 variants.
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
