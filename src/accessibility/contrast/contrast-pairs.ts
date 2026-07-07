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
	// Was waived (light text on the fixed light --accent in dark-based themes)
	// until the role-corrections chantier tied --fg-on-accent to the theme's
	// dark rail endpoint by luminance instead of the inverting $gray-950: now
	// 13.70:1 in dark, compliant in all 12 themes.
	{ id: "role/fg-on-accent-on-accent", fg: "--fg-on-accent", bg: "--accent", level: "text" },
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
				"(PLAN-revue-moteurs.md phase 3). The 4 red-green CVD themes were " +
				"resolved by chantier E2 (refonte daltonienne, part 2 — semantic " +
				"status anchors): --success now resolves to a weight guaranteeing " +
				">= 4.5:1 (violet-600 = 5.46:1 in the -opias, emerald-700 = 5.25:1 " +
				"in the -omalies), so their entries are gone. Remaining waived " +
				"themes are the non-CVD light/anti-glare-light and the tritan/" +
				"achromatopsia themes, where --success keeps its emerald-600 value " +
				"(tritan doesn't remap emerald; achromatopsia is out of scope).",
			preexisting: true,
			measured: {
				light: 3.6079,
				"anti-glare-light": 3.1323,
				tritanomaly: 3.6079,
				tritanopia: 3.6079,
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
				"anti-glare-light only, as of chantier E2 (refonte daltonienne). The " +
				"6 CVD-theme failures documented here since chantier E1 — the old " +
				"CVD-engine substitution colors (e.g. #ffcc00 in deuteranopia, " +
				"chosen for perceptual distinguishability, not contrast, as low as " +
				"1.34:1) — are resolved: --danger now resolves to a weight " +
				">= 4.5:1 in all 6 CVD themes (orange-700 = 4.96:1 in the -opias " +
				"via the part-2 semantic status anchor, redd-600 = 4.62:1 kept in " +
				"the -omalies, amber-based in tritan). anti-glare-light's ratio " +
				"rose (3.46 → 3.94, still non-compliant) after the chantier E2 " +
				"OKLCH anti-glare rewrite (PLAN-revue-moteurs.md phase 3), " +
				"unrelated to the CVD work. --danger remains currently " +
				"unreferenced by any component.",
			preexisting: true,
			measured: {
				"anti-glare-light": 3.9425,
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
	// site/hero-text-on-hero-bg removed with the dead --color-hero-bg/-text
	// custom properties (2026-07-07 emitted/consumed audit): emitted but
	// consumed by no component (the hero section renders on --color-main-bg).
	// Removed because the tokens are gone, not to hide a failure.
	// Was waived (same root cause as role/fg-on-accent-on-accent) until the
	// role-corrections chantier fixed --fg-on-accent by luminance: now 13.70:1
	// in dark, compliant everywhere.
	{ id: "site/header-text-on-header-bg", fg: "--color-header-text", bg: "--color-header-bg", level: "text" },
	// Was waived (fg-muted inverting to near-white on the fixed light accent
	// in dark-based themes) until the role-corrections chantier anchored the
	// subtitle to a fixed muted gray chosen by luminance (Simon's call:
	// atténué partout) — now 7.12:1 in dark, compliant everywhere.
	{ id: "site/header-text-role-on-header-bg", fg: "--color-header-text-role", bg: "--color-header-bg", level: "text" },
	// Was waived (amber accent on the inverting bg-emphasis chip) until the
	// role-corrections chantier rewired the blog-link text to fg-on-emphasis
	// (Simon's call: the link follows its chip) — the fg-on-emphasis/
	// bg-emphasis pair is already guaranteed in all 12 themes; 9.84:1 in dark.
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
	// site/button-active-outline-on-panel-bg removed with the dead
	// --color-button-active-outline custom property (role-corrections
	// chantier): it was emitted but consumed by no component, and was the
	// worst waiver (1.00:1 in high-contrast). Removed because the token is
	// gone, not to hide a failure.
];

// The registry is extensible: a pair that fails gets a waiver (phase 3), it
// is never deleted to hide a failure — the only removals are pairs whose
// underlying custom property no longer exists (dead code).
export const contrastPairs: readonly ContrastPair[] = [...rolePairs, ...sitePairs];

// ---------------------------------------------------------------------
// Distinguishability pairs (chantier E2 (refonte daltonienne), PLAN-refonte-daltonienne.md
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
// threshold — Simon adjusts it during phase 4 validation. This is the
// threshold for the critical pairs, where confusing the two colors is a
// genuine information loss: success vs danger above all, and each status
// role vs the accent.
const DEFAULT_MIN_DELTA_E = 20;

// Lower threshold for pairs where one member is `--link` (PLAN-refonte-
// daltonienne.md part 2, phase 1). A link is never conveyed by color alone:
// WCAG 2.2 SC 1.4.1 (Use of Color) requires an additional cue, and this
// site underlines links — so a link merely *approaching* the hue of a
// status color, or of body text, is not the same order of failure as
// confusing success with danger. Keeping these pairs at 20 is what forced
// the part-1 calibration into the contrast-destroying `emerald → sky (-3)`
// weight shift; 12 keeps a visible separation without over-constraining.
const LINK_PAIR_MIN_DELTA_E = 12;

export const distinguishabilityPairs: readonly DistinguishabilityPair[] = [
	{
		// Waiver removed (chantier E2 (refonte daltonienne) phase 3): tritanopia's old
		// special-colors for --success/--danger (#ff6600/#ff3399,
		// hand-picked without a documented distinguishability check)
		// collapsed to ΔE 6.81 under tritanopia simulation. Tritanopia's
		// family-remap table doesn't touch emerald/redd (already safe for
		// the blue-yellow confusion axis, per the plan), so dropping the
		// special-colors default left --success/--danger at their plain
		// emerald-600/red-600 values — which measure ΔE 69.66, a large
		// improvement with zero design effort. All 7 CVD themes pass.
		id: "distinguish/success-vs-danger",
		colorA: "--success",
		colorB: "--danger",
		themes: ALL_CVD_THEMES,
		minDeltaE: DEFAULT_MIN_DELTA_E,
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
		minDeltaE: LINK_PAIR_MIN_DELTA_E,
	},
	{
		id: "distinguish/link-vs-fg-base",
		colorA: "--link",
		colorB: "--fg-base",
		themes: ALL_CVD_THEMES,
		// Was waived at ΔE 16.00 for achromatopsia against the old 20
		// threshold; under LINK_PAIR_MIN_DELTA_E (12) that measurement now
		// passes, so the waiver is gone (keeping it would trip the
		// anti-zombie check). sky-900 vs gray-950 under monochromacy stays a
		// link-class pair: both dark, but the link is also underlined.
		minDeltaE: LINK_PAIR_MIN_DELTA_E,
	},
];
