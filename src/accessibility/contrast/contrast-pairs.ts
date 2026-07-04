/** @format */

import type { ThemeOption } from "../../config/themes";
import type { ContrastLevel } from "./wcag";

export type { ContrastLevel };

export type ContrastPair = {
	/** Stable identifier, e.g. "role/fg-base-on-bg-base". */
	id: string;
	/** Custom property name of the foreground color, e.g. "--fg-base". */
	fg: string;
	/** Custom property name of the background color. */
	bg: string;
	level: ContrastLevel;
	/**
	 * Custom property to composite `fg` over before computing the ratio,
	 * required whenever `fg` (or `bg`) carries an alpha channel < 1.
	 */
	composeOver?: string;
	/** Defaults to all 12 themes when omitted. */
	themes?: readonly ThemeOption[];
	waiver?: {
		reason: string;
		/** true = already failing when the contrast-test system was introduced. */
		preexisting: boolean;
		/** theme -> measured ratio, filled in as failures are inventoried (phase 3). */
		measured?: Record<string, number>;
	};
};

// Layer-2 (role) pairs — this subset is what will ship in the future
// package (README §6.1 / GUIDE-extraction-paquet.md §E7): every consumer
// that keeps the role *names* inherits these guarantees regardless of the
// values it assigns to them.
const rolePairs: ContrastPair[] = [
	{ id: "role/fg-base-on-bg-base", fg: "--fg-base", bg: "--bg-base", level: "text" },
	{ id: "role/fg-base-on-bg-subtle", fg: "--fg-base", bg: "--bg-subtle", level: "text" },
	{ id: "role/fg-base-on-bg-container", fg: "--fg-base", bg: "--bg-container", level: "text" },
	{ id: "role/fg-muted-on-bg-base", fg: "--fg-muted", bg: "--bg-base", level: "text" },
	{ id: "role/fg-on-emphasis-on-bg-emphasis", fg: "--fg-on-emphasis", bg: "--bg-emphasis", level: "text" },
	{ id: "role/fg-on-emphasis-on-bg-emphasis-strong", fg: "--fg-on-emphasis", bg: "--bg-emphasis-strong", level: "text" },
	{ id: "role/fg-on-emphasis-on-bg-inverse", fg: "--fg-on-emphasis", bg: "--bg-inverse", level: "text" },
	{
		id: "role/fg-on-accent-on-accent",
		fg: "--fg-on-accent",
		bg: "--accent",
		level: "text",
		waiver: {
			reason:
				"--accent is intentionally NOT inverted between light and dark themes " +
				"(#fcd34d in both), but --fg-on-accent inverts together with the rest " +
				"of the text roles (near-black #0c0a09 in light, near-white #e7e5e4 in " +
				"dark) — in the dark-based themes this puts light text on a background " +
				"that stayed light. Pre-existing since the role layer was introduced " +
				"(fondations migration); same root cause as site/header-text-on-header-bg.",
			preexisting: true,
			measured: { dark: 1.1484, "anti-glare-dark": 1.1791 },
		},
	},
	{ id: "role/accent-ink-on-accent-soft", fg: "--accent-ink", bg: "--accent-soft", level: "text" },
	{ id: "role/accent-ink-on-bg-base", fg: "--accent-ink", bg: "--bg-base", level: "text" },
	{ id: "role/accent-ink-on-bg-subtle", fg: "--accent-ink", bg: "--bg-subtle", level: "text" },
	{ id: "role/link-on-bg-base", fg: "--link", bg: "--bg-base", level: "text" },
	{ id: "role/link-on-bg-subtle", fg: "--link", bg: "--bg-subtle", level: "text" },
	{ id: "role/link-on-bg-container", fg: "--link", bg: "--bg-container", level: "text" },
	{ id: "role/link-hover-on-bg-base", fg: "--link-hover", bg: "--bg-base", level: "text" },
	{
		id: "role/success-on-bg-base",
		fg: "--success",
		bg: "--bg-base",
		level: "text",
		waiver: {
			reason:
				"emerald-600 (--success) is chosen for semantic recognizability, not " +
				"for WCAG contrast against --bg-base; --success is currently " +
				"unreferenced by any component (no var(--success) in src/styles or " +
				"src/components). Pre-existing since the role's introduction.",
			preexisting: true,
			measured: {
				light: 3.6079,
				"anti-glare-light": 2.8507,
				deuteranomaly: 3.6079,
				deuteranopia: 4.0306,
				protanomaly: 3.6079,
				protanopia: 3.1254,
				tritanomaly: 3.6079,
				tritanopia: 2.8112,
				achromatopsia: 2.4167,
			},
		},
	},
	{
		id: "role/danger-on-bg-base",
		fg: "--danger",
		bg: "--bg-base",
		level: "text",
		waiver: {
			reason:
				"red-600 (--danger) meets 4.5:1 against --bg-base in most themes, but " +
				"the CVD-engine substitution colors (e.g. #ffcc00 in deuteranopia / " +
				"protanopia, chosen for perceptual distinguishability for that vision " +
				"deficiency, not for contrast) drop well below threshold; " +
				"anti-glare-light's warmth shift also erodes the margin. --danger is " +
				"currently unreferenced by any component. Pre-existing; candidate for " +
				"PLAN-refonte-daltonienne.md.",
			preexisting: true,
			measured: {
				"anti-glare-light": 3.4637,
				deuteranomaly: 3.333,
				deuteranopia: 1.4477,
				protanomaly: 3.2777,
				protanopia: 1.343,
				tritanopia: 3.2507,
			},
		},
	},
	{ id: "role/focus-ring-on-bg-base", fg: "--focus-ring", bg: "--bg-base", level: "non-text" },
	{ id: "role/border-strong-on-bg-base", fg: "--border-strong", bg: "--bg-base", level: "non-text" },
];

// Layer-3 (site) pairs — specific to this portfolio's component wiring,
// never shipped in the package (README §6.1). Extensible by any consumer
// for its own layer-3 tokens.
const sitePairs: ContrastPair[] = [
	{ id: "site/main-text-on-main-bg", fg: "--color-main-text", bg: "--color-main-bg", level: "text" },
	{ id: "site/hero-text-on-hero-bg", fg: "--color-hero-text", bg: "--color-hero-bg", level: "text" },
	{
		id: "site/header-text-on-header-bg",
		fg: "--color-header-text",
		bg: "--color-header-bg",
		level: "text",
		waiver: {
			reason:
				"--color-header-text = --fg-on-accent, --color-header-bg = --accent — " +
				"identical pair and root cause as role/fg-on-accent-on-accent.",
			preexisting: true,
			measured: { dark: 1.1484, "anti-glare-dark": 1.1791 },
		},
	},
	// fg-muted rendered on the accent background — sensitive pair (small
	// role/primitive contrast margin by construction, see README §6.1).
	{
		id: "site/header-text-role-on-header-bg",
		fg: "--color-header-text-role",
		bg: "--color-header-bg",
		level: "text",
		waiver: {
			reason:
				"--color-header-text-role = --fg-muted, which inverts to near-white " +
				"(#fafaf9) in the dark-based themes, rendered on --color-header-bg = " +
				"--accent, which stays a fixed light amber (#fcd34d) in every theme — " +
				"near-white on light-amber in dark-based themes. Same two resolved " +
				"colors (swapped) as site/header-blog-link-text-on-bg, hence the " +
				"matching ratios. Pre-existing.",
			preexisting: true,
			measured: { dark: 1.3806, "anti-glare-dark": 1.4171 },
		},
	},
	{
		id: "site/header-blog-link-text-on-bg",
		fg: "--color-header-blog-link-text",
		bg: "--color-header-blog-link-bg",
		level: "text",
		waiver: {
			reason:
				"--color-header-blog-link-text = --accent (fixed light amber #fcd34d " +
				"in every theme) on --color-header-blog-link-bg = --bg-emphasis, which " +
				"inverts to near-white (#fafaf9) in the dark-based themes — light " +
				"amber on near-white. Same two resolved colors (swapped) as " +
				"site/header-text-role-on-header-bg. Pre-existing.",
			preexisting: true,
			measured: { dark: 1.3806, "anti-glare-dark": 1.4171 },
		},
	},
	{ id: "site/lang-toggle-text-activated-on-bg", fg: "--color-lang-toggle-text-activated", bg: "--color-lang-toggle-bg-activated", level: "text" },
	{ id: "site/lang-toggle-text-disabled-on-bg", fg: "--color-lang-toggle-text-disabled", bg: "--color-lang-toggle-bg", level: "text" },
	{ id: "site/collapse-title-on-bg-title", fg: "--color-collapse-title", bg: "--color-collapse-bg-title", level: "text" },
	{ id: "site/section-title-on-bg-odd", fg: "--color-section-title", bg: "--color-section-bg-odd", level: "text" },
	{ id: "site/portfolio-tag-text-on-bg", fg: "--color-portfolio-tag-text", bg: "--color-portfolio-tag-bg", level: "text" },
	{ id: "site/bottom-footer-title-on-bg", fg: "--color-bottom-footer-title", bg: "--color-bottom-footer-bg", level: "text" },
	{ id: "site/bottom-footer-text-on-bg", fg: "--color-bottom-footer-text", bg: "--color-bottom-footer-bg", level: "text" },
	{ id: "site/bottom-footer-link-text-on-bg", fg: "--color-bottom-footer-link-text", bg: "--color-bottom-footer-link-bg", level: "text" },
	{ id: "site/sticky-footer-text-on-bg", fg: "--color-sticky-footer-text", bg: "--color-sticky-footer-bg", level: "text" },
	{ id: "site/about-overlay-text-on-bg", fg: "--color-about-overlay-text", bg: "--color-about-overlay-bg", level: "text" },
	{ id: "site/about-button-text-on-bg", fg: "--color-about-button-text", bg: "--color-about-button-bg", level: "text" },
	{ id: "site/skills-icon-text-on-bg", fg: "--color-skills-icon-text", bg: "--color-skills-icon-bg", level: "text" },
	{ id: "site/focus-text-on-focus-bg", fg: "--color-focus-text", bg: "--color-focus-bg", level: "text" },
	{
		id: "site/tooltip-text-on-tooltip-bg",
		fg: "--color-tooltip-text",
		bg: "--color-tooltip-bg",
		level: "text",
		composeOver: "--bg-base", // --color-tooltip-bg carries alpha (rgba(bg-inverse, 0.9))
	},
	{ id: "site/scroll-progress-indicator-on-bg-base", fg: "--color-scroll-progress-indicator", bg: "--bg-base", level: "non-text" },
	{
		id: "site/button-active-outline-on-panel-bg",
		fg: "--color-button-active-outline",
		bg: "--color-panel-bg",
		level: "non-text",
		waiver: {
			reason:
				"--color-button-active-outline = --accent, --color-panel-bg = " +
				"--bg-base. In high-contrast both resolve to the exact same value " +
				"(#000000) — the outline is literally indistinguishable from its " +
				"background (ratio 1.0:1). In the other light-based themes --accent " +
				"stays a light amber against a near-white --bg-base, inherently under " +
				"the 3:1 non-text threshold; dark-based themes pass because --bg-base " +
				"itself becomes dark there. Pre-existing; a higher-contrast role " +
				"(--accent-strong) already exists but is not wired to this token. " +
				"anti-glare-light's ratio dropped further (1.38 → 1.06) after the " +
				"chantier E2 single-pass anti-glare fix gave this pair its first-ever " +
				"anti-glare attenuation (previously unattenuated, matching `light`) — " +
				"see PLAN-revue-moteurs.md phase 2.",
			preexisting: true,
			measured: {
				light: 1.3806,
				"anti-glare-light": 1.057,
				"high-contrast": 1.0,
				deuteranomaly: 1.128,
				deuteranopia: 1.18,
				protanomaly: 1.128,
				protanopia: 1.18,
				tritanomaly: 1.0241,
				tritanopia: 1.0579,
				achromatopsia: 1.2069,
			},
		},
	},
];

// The registry is extensible, never amputated: a pair that fails gets a
// waiver (phase 3), it is never deleted.
export const contrastPairs: readonly ContrastPair[] = [...rolePairs, ...sitePairs];
