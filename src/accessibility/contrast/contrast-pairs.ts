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
	{ id: "role/fg-on-accent-on-accent", fg: "--fg-on-accent", bg: "--accent", level: "text" },
	{ id: "role/accent-ink-on-accent-soft", fg: "--accent-ink", bg: "--accent-soft", level: "text" },
	{ id: "role/accent-ink-on-bg-base", fg: "--accent-ink", bg: "--bg-base", level: "text" },
	{ id: "role/accent-ink-on-bg-subtle", fg: "--accent-ink", bg: "--bg-subtle", level: "text" },
	{ id: "role/link-on-bg-base", fg: "--link", bg: "--bg-base", level: "text" },
	{ id: "role/link-on-bg-subtle", fg: "--link", bg: "--bg-subtle", level: "text" },
	{ id: "role/link-on-bg-container", fg: "--link", bg: "--bg-container", level: "text" },
	{ id: "role/link-hover-on-bg-base", fg: "--link-hover", bg: "--bg-base", level: "text" },
	{ id: "role/success-on-bg-base", fg: "--success", bg: "--bg-base", level: "text" },
	{ id: "role/danger-on-bg-base", fg: "--danger", bg: "--bg-base", level: "text" },
	{ id: "role/focus-ring-on-bg-base", fg: "--focus-ring", bg: "--bg-base", level: "non-text" },
	{ id: "role/border-strong-on-bg-base", fg: "--border-strong", bg: "--bg-base", level: "non-text" },
];

// Layer-3 (site) pairs — specific to this portfolio's component wiring,
// never shipped in the package (README §6.1). Extensible by any consumer
// for its own layer-3 tokens.
const sitePairs: ContrastPair[] = [
	{ id: "site/main-text-on-main-bg", fg: "--color-main-text", bg: "--color-main-bg", level: "text" },
	{ id: "site/hero-text-on-hero-bg", fg: "--color-hero-text", bg: "--color-hero-bg", level: "text" },
	{ id: "site/header-text-on-header-bg", fg: "--color-header-text", bg: "--color-header-bg", level: "text" },
	// fg-muted rendered on the accent background — sensitive pair (small
	// role/primitive contrast margin by construction, see README §6.1).
	{ id: "site/header-text-role-on-header-bg", fg: "--color-header-text-role", bg: "--color-header-bg", level: "text" },
	{ id: "site/header-blog-link-text-on-bg", fg: "--color-header-blog-link-text", bg: "--color-header-blog-link-bg", level: "text" },
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
	{ id: "site/button-active-outline-on-panel-bg", fg: "--color-button-active-outline", bg: "--color-panel-bg", level: "non-text" },
];

// The registry is extensible, never amputated: a pair that fails gets a
// waiver (phase 3), it is never deleted.
export const contrastPairs: readonly ContrastPair[] = [...rolePairs, ...sitePairs];
