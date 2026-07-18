/** @format */

// Types and default ROLE pairs for the contrast verifier (E6.6). The
// package ships pair definitions for its ~19 roles — the API every
// consumer inherits. The consumer applies their own waivers (overlay) on
// top and adds their layer-3 pairs.

import type { ContrastLevel } from "./wcag";
import type { CvdTheme } from "./cvd-simulation";

export type { ContrastLevel };

export type Waiver = {
	reason: string;
	/** true = already failing when the test system was introduced. */
	preexisting: boolean;
	/** theme -> measured ratio. */
	measured?: Record<string, number>;
};

export type ContrastPair = {
	/** Stable identifier, e.g. "role/fg-base-on-bg-base". */
	id: string;
	/** Custom property of the foreground color, e.g. "--fg-base". */
	fg: string;
	/** Custom property of the background color. */
	bg: string;
	level: ContrastLevel;
	/** Custom property to composite `fg`/`bg` over if alpha < 1. */
	composeOver?: string;
	/** Themes concerned (default: all those passed to the report). */
	themes?: readonly string[];
	waiver?: Waiver;
};

export type DistinguishabilityPair = {
	id: string;
	colorA: string;
	colorB: string;
	composeOverA?: string;
	composeOverB?: string;
	themes: readonly CvdTheme[];
	minDeltaE: number;
	waiver?: Waiver;
};

// Applies a waiver overlay (id -> waiver) to a list of pairs — the
// consumer documents THEIR failures without redefining the package's pairs.
export function withWaivers<T extends { id: string; waiver?: Waiver }>(
	pairs: readonly T[],
	waivers: Readonly<Record<string, Waiver>>,
): T[] {
	return pairs.map((p) =>
		waivers[p.id] ? { ...p, waiver: waivers[p.id] } : p,
	);
}

// Default role pairs (layer 2). Definitions only, no waivers: a fresh
// consumer starts with none. They add their own via withWaivers().
export const defaultRolePairs: readonly ContrastPair[] = [
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

export const ALL_CVD_THEMES: readonly CvdTheme[] = [
	"deuteranomaly",
	"deuteranopia",
	"protanomaly",
	"protanopia",
	"tritanomaly",
	"tritanopia",
	"achromatopsia",
];

// ΔE distinguishability thresholds, empirically calibrated.
export const DEFAULT_MIN_DELTA_E = 20;
export const LINK_PAIR_MIN_DELTA_E = 12;

// Default distinguishability pairs (on the status/accent/link roles).
export const defaultDistinguishabilityPairs: readonly DistinguishabilityPair[] = [
	{ id: "distinguish/success-vs-danger", colorA: "--success", colorB: "--danger", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/accent-vs-danger", colorA: "--accent", colorB: "--danger", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/accent-vs-success", colorA: "--accent", colorB: "--success", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/link-vs-success", colorA: "--link", colorB: "--success", themes: ALL_CVD_THEMES, minDeltaE: LINK_PAIR_MIN_DELTA_E },
	{ id: "distinguish/link-vs-fg-base", colorA: "--link", colorB: "--fg-base", themes: ALL_CVD_THEMES, minDeltaE: LINK_PAIR_MIN_DELTA_E },
];
