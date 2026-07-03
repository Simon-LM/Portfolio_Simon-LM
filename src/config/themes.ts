/** @format */
// Single source of truth for the theme list.
// NOTE: the SCSS [data-theme] blocks in src/styles/abstracts/_theme-system.scss
// must stay in sync manually until the system is extracted as a package.
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
