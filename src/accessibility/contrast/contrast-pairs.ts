/** @format */

import type { ThemeOption } from "../../config/themes";
import type { ContrastLevel } from "./wcag";
import type { CvdTheme } from "./cvd-simulation";

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
				"(fondations migration); same root cause as site/header-text-on-header-bg. " +
				"anti-glare-dark's ratio shifted slightly (1.18 → 1.15) after the " +
				"chantier E2 OKLCH anti-glare rewrite (PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: { dark: 1.1484, "anti-glare-dark": 1.1459 },
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
				"src/components). Pre-existing since the role's introduction. " +
				"anti-glare-light's ratio rose slightly (2.85 → 3.13, still " +
				"non-compliant) after the chantier E2 OKLCH anti-glare rewrite " +
				"(PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: {
				light: 3.6079,
				"anti-glare-light": 3.1323,
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
				"PLAN-refonte-daltonienne.md. anti-glare-light's ratio rose (3.46 → " +
				"3.94, still non-compliant) after the chantier E2 OKLCH anti-glare " +
				"rewrite (PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: {
				"anti-glare-light": 3.9425,
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
				"identical pair and root cause as role/fg-on-accent-on-accent. " +
				"anti-glare-dark's ratio shifted slightly (1.18 -> 1.15) after the " +
				"chantier E2 OKLCH anti-glare rewrite (PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: { dark: 1.1484, "anti-glare-dark": 1.1459 },
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
				"matching ratios. Pre-existing. anti-glare-dark's ratio shifted " +
				"slightly (1.42 -> 1.38) after the chantier E2 OKLCH anti-glare " +
				"rewrite (PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: { dark: 1.3806, "anti-glare-dark": 1.3816 },
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
				"site/header-text-role-on-header-bg. Pre-existing. anti-glare-dark's " +
				"ratio shifted slightly (1.42 -> 1.38) after the chantier E2 OKLCH " +
				"anti-glare rewrite (PLAN-revue-moteurs.md phase 3).",
			preexisting: true,
			measured: { dark: 1.3806, "anti-glare-dark": 1.3816 },
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
				"anti-glare-light's ratio dropped slightly (1.38 → 1.31) after " +
				"chantier E2: phase 2 gave this pair its first-ever anti-glare " +
				"attenuation (previously unattenuated, matching `light`), then the " +
				"phase 3 OKLCH rewrite settled it at 1.31 — see PLAN-revue-moteurs.md.",
			preexisting: true,
			measured: {
				light: 1.3806,
				"anti-glare-light": 1.307,
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

// ---------------------------------------------------------------------
// Distinguishability pairs (chantier E3, PLAN-refonte-daltonienne.md
// phase 1) — a different question from the WCAG ratio pairs above: not
// "is this readable against its background" but "do these two semantic
// colors still look different from each other once CVD simulation is
// applied". Measured in ΔE CIEDE2000 between the two colors *after*
// simulateForCvdTheme(), not a contrast ratio — kept in a parallel
// registry/type rather than folded into ContrastPair, since the two kinds
// share nothing beyond id/waiver (no `level`, no WCAG threshold, no
// `bg`/`fg` roles — two arbitrary colors and a CVD-only theme list).
export type DistinguishabilityPair = {
	/** Stable identifier, e.g. "distinguish/success-vs-danger". */
	id: string;
	/** Custom property name of the first color, e.g. "--success". */
	colorA: string;
	/** Custom property name of the second color. */
	colorB: string;
	/** Composite colorA over this custom property first (alpha channel). */
	composeOverA?: string;
	/** Composite colorB over this custom property first (alpha channel). */
	composeOverB?: string;
	/** CVD themes this pair is checked against (no non-CVD default). */
	themes: readonly CvdTheme[];
	/** Minimum ΔE CIEDE2000 required between the two simulated colors. */
	minDeltaE: number;
	waiver?: {
		reason: string;
		preexisting: boolean;
		measured?: Record<string, number>;
	};
};

const ALL_CVD_THEMES: readonly CvdTheme[] = [
	"deuteranomaly",
	"deuteranopia",
	"protanomaly",
	"protanopia",
	"tritanomaly",
	"tritanopia",
	"achromatopsia",
];

// ΔE ≥ 20 is a calibration starting point (plan § phase 1), not a proven
// threshold — Simon adjusts it during phase 4 validation.
const DEFAULT_MIN_DELTA_E = 20;

export const distinguishabilityPairs: readonly DistinguishabilityPair[] = [
	{
		id: "distinguish/success-vs-danger",
		colorA: "--success",
		colorB: "--danger",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
		waiver: {
			reason:
				"emerald-600 (--success, #059669) and red-600 (--danger, #dc2626) " +
				"collapse to nearly the same perceived color under tritanopia " +
				"simulation (ΔE 6.81) — tritanopia's blue-yellow confusion axis " +
				"leaves little to separate a mid-green and a mid-red that both " +
				"carry almost no blue component. Both roles are currently " +
				"unreferenced by any component. Pre-existing to this measurement " +
				"system; candidate for the family-remap tables (phase 3).",
			preexisting: true,
			measured: { tritanopia: 6.8121 },
		},
	},
	{
		id: "distinguish/accent-vs-danger",
		colorA: "--accent",
		colorB: "--danger",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
	},
	{
		id: "distinguish/accent-vs-success",
		colorA: "--accent",
		colorB: "--success",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
		waiver: {
			reason:
				"amber-300 (--accent, #fcd34d) and emerald-600 (--success, #059669) " +
				"have similar BT.601 luma once desaturated to grayscale, so " +
				"achromatopsia simulation collapses them close together (ΔE 16.75, " +
				"just under the 20 threshold). --success is currently unreferenced " +
				"by any component. Pre-existing; achromatopsia's own mechanism is " +
				"explicitly out of scope for this refonte (kept as-is).",
			preexisting: true,
			measured: { achromatopsia: 16.7522 },
		},
	},
	{
		id: "distinguish/link-vs-success",
		colorA: "--link",
		colorB: "--success",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
	},
	{
		id: "distinguish/link-vs-fg-base",
		colorA: "--link",
		colorB: "--fg-base",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
		waiver: {
			reason:
				"sky-900 (--link, #0c4a6e) and gray-950 (--fg-base, #0c0a09) are " +
				"both very dark colors with similar BT.601 luma, so achromatopsia " +
				"simulation collapses them close together (ΔE 16.00, just under " +
				"the 20 threshold) — a link rendered at body-text darkness reads " +
				"as barely darker gray in full monochromacy. Achromatopsia's own " +
				"mechanism is explicitly out of scope for this refonte (kept as-is); " +
				"candidate for a future --link lightness adjustment if this matters " +
				"in practice (links are also underlined/styled beyond color).",
			preexisting: true,
			measured: { achromatopsia: 15.9997 },
		},
	},
];
