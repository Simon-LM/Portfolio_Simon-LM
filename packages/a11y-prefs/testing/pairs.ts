/** @format */

// Types et paires de RÔLES par défaut du vérificateur de contrastes
// (chantier E6.6). Le paquet livre les définitions de paires sur ses ~19
// rôles — l'API que tout consommateur hérite. Le consommateur y applique ses
// propres waivers (overlay) et ajoute ses paires de couche 3.

import type { ContrastLevel } from "./wcag";
import type { CvdTheme } from "./cvd-simulation";

export type { ContrastLevel };

export type Waiver = {
	reason: string;
	/** true = déjà en échec quand le système de tests a été introduit. */
	preexisting: boolean;
	/** thème -> ratio mesuré. */
	measured?: Record<string, number>;
};

export type ContrastPair = {
	/** Identifiant stable, ex. "role/fg-base-on-bg-base". */
	id: string;
	/** Custom property de la couleur de premier plan, ex. "--fg-base". */
	fg: string;
	/** Custom property de la couleur de fond. */
	bg: string;
	level: ContrastLevel;
	/** Custom property sur laquelle composer `fg`/`bg` si alpha < 1. */
	composeOver?: string;
	/** Thèmes concernés (défaut : tous ceux passés au rapport). */
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

// Applique un overlay de waivers (id -> waiver) sur une liste de paires —
// le consommateur documente SES échecs sans redéfinir les paires du paquet.
export function withWaivers<T extends { id: string; waiver?: Waiver }>(
	pairs: readonly T[],
	waivers: Readonly<Record<string, Waiver>>,
): T[] {
	return pairs.map((p) =>
		waivers[p.id] ? { ...p, waiver: waivers[p.id] } : p,
	);
}

// Paires de rôles par défaut (couche 2). Définitions seules, sans waiver :
// un consommateur frais n'en a aucun. Il ajoute les siens via withWaivers().
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

// Seuils ΔE de distinguabilité (calibrés au chantier daltonien).
export const DEFAULT_MIN_DELTA_E = 20;
export const LINK_PAIR_MIN_DELTA_E = 12;

// Paires de distinguabilité par défaut (sur les rôles statut/accent/link).
export const defaultDistinguishabilityPairs: readonly DistinguishabilityPair[] = [
	{ id: "distinguish/success-vs-danger", colorA: "--success", colorB: "--danger", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/accent-vs-danger", colorA: "--accent", colorB: "--danger", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/accent-vs-success", colorA: "--accent", colorB: "--success", themes: ALL_CVD_THEMES, minDeltaE: DEFAULT_MIN_DELTA_E },
	{ id: "distinguish/link-vs-success", colorA: "--link", colorB: "--success", themes: ALL_CVD_THEMES, minDeltaE: LINK_PAIR_MIN_DELTA_E },
	{ id: "distinguish/link-vs-fg-base", colorA: "--link", colorB: "--fg-base", themes: ALL_CVD_THEMES, minDeltaE: LINK_PAIR_MIN_DELTA_E },
];
