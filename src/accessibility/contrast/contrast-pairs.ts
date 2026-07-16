/** @format */

// PORTFOLIO's contrast pairs registry (consumer config, E6.6). ROLE pair
// definitions + types come from the package (`darkmode-plus-a11y/testing/pairs`);
// here we apply OUR waivers as an overlay and add OUR layer-3 pairs.

import {
	type ContrastPair,
	type DistinguishabilityPair,
	type ContrastLevel,
	type Waiver,
	defaultRolePairs,
	defaultDistinguishabilityPairs,
	withWaivers,
} from "darkmode-plus-a11y/testing/pairs";

export type { ContrastPair, DistinguishabilityPair, ContrastLevel };

// Portfolio waivers on role pairs (documented failures, never removed —
// anti-zombie).
const rolePairWaivers: Readonly<Record<string, Waiver>> = {
	"role/success-on-bg-base": {
		reason:
			"achromatopsia only. --success was bumped emerald-600 → emerald-700 " +
			"(Simon's call, 2026-07-07) when the contact success toast was wired " +
			"to var(--success): light/anti-glare-light/tritan now pass (5.25 / " +
			"4.56 / 5.25). Achromatopsia is unchanged: its engine requantizes " +
			"luminance onto the neutral rail and emerald-600 and emerald-700 " +
			"land on the same gray (#a3a3a3, 2.42:1). Achromatopsia's own " +
			"mechanism is explicitly out of scope (kept as-is); candidate for a " +
			"darker neutral quantization if the role's use grows.",
		preexisting: true,
		measured: { achromatopsia: 2.4167 },
	},
	"role/danger-on-bg-base": {
		reason:
			"anti-glare-light only, as of chantier E2 (refonte daltonienne). The " +
			"6 CVD-theme failures documented here since chantier E1 — the old " +
			"CVD-engine substitution colors (e.g. #ffcc00 in deuteranopia, " +
			"chosen for perceptual distinguishability, not contrast, as low as " +
			"1.34:1) — are resolved: --danger now resolves to a weight " +
			">= 4.5:1 in all 6 CVD themes (orange-700 = 4.96:1 in the -opias " +
			"via the part-2 semantic status anchor, red-600 = 4.62:1 kept in " +
			"the -omalies, amber-based in tritan). anti-glare-light's ratio " +
			"rose (3.46 → 3.94, still non-compliant) after the chantier E2 " +
			"OKLCH anti-glare rewrite (PLAN-engine-review.md phase 3), " +
			"unrelated to the CVD work. --danger remains currently " +
			"unreferenced by any component.",
		preexisting: true,
		measured: { "anti-glare-light": 3.9425 },
	},
};

// LAYER-3 pairs (portfolio component wiring) — never in the package; a
// consumer adds their own the same way.
const sitePairs: ContrastPair[] = [
	{ id: "site/main-text-on-main-bg", fg: "--color-main-text", bg: "--color-main-bg", level: "text" },
	{ id: "site/header-text-on-header-bg", fg: "--color-header-text", bg: "--color-header-bg", level: "text" },
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
];

// Portfolio waivers on distinguishability pairs.
const distinguishabilityWaivers: Readonly<Record<string, Waiver>> = {
	"distinguish/accent-vs-success": {
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
};

export const contrastPairs: readonly ContrastPair[] = [
	...withWaivers(defaultRolePairs, rolePairWaivers),
	...sitePairs,
];

export const distinguishabilityPairs: readonly DistinguishabilityPair[] =
	withWaivers(defaultDistinguishabilityPairs, distinguishabilityWaivers);
