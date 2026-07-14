/** @format */

// Name-based SEMANTIC inspector for high contrast (extracted from the
// portfolio, pre-E7). Names decide NO color (the layer-2 wiring decides
// that); they MONITOR: if a token's name suggests a family (text,
// background, link, focus) and the emitted value contradicts it, a
// warning is emitted. Never blocking, never a modification — it catches
// crossed wiring that lands inside the palette, the blind spot of the
// value-based control (see AGENTS.md § Verifying your wiring).
//
// This module is deliberately SELF-CONTAINED (no relative imports): it is
// consumed both by TypeScript test runners (extensionless subpath import)
// and by the `audit` CLI entry (run-audit.ts) under Node's native type
// stripping, where relative specifiers need explicit extensions.

/** Custom properties of one theme block, as extracted from the CSS. */
export type HcThemeVars = ReadonlyMap<string, string>;

/** Palette slots of a high-contrast theme (canonical source: the theme's
 *  HC color map). Keys are slot names; values are lowercase colors. */
export type HcSlots = Record<string, string>;

export type HcWaiver = { pattern: RegExp; reason: string };

export type HcAuditFinding = {
	theme: string;
	name: string;
	value: string;
	family: string;
	conflictingSlot: string;
	waived: string | null;
};

export type HcAuditOptions = {
	/** High-contrast theme names to audit. */
	themes: readonly string[];
	/** Custom properties of a theme block (typically getThemeVars().get). */
	varsFor: (theme: string) => HcThemeVars | undefined;
	/** Palette slots per theme. Default: deriveHcSlots (best effort from
	 *  the emitted role variables — pass explicit slots for precision, the
	 *  canonical values live in the theme's HC color map). */
	slotsFor?: (theme: string, vars: HcThemeVars) => HcSlots | undefined;
	/** Waiver overlay. Default: defaultHcWaivers (package roles only) —
	 *  spread it and append your site-specific waivers. */
	waivers?: readonly HcWaiver[];
	/** Semantic families (name synonyms). Default: DEFAULT_FAMILIES. */
	families?: Record<string, readonly string[]>;
	/** Monitored contradictions per family. Default: DEFAULT_CONTRADICTIONS. */
	contradictions?: Record<string, readonly string[]>;
};

// Semantic families — synonyms a dev (or an AI) is likely to use in their
// layer-3 variable names. Matching happens on WHOLE SEGMENTS (split on -
// and _): "context" does not match "text".
export const DEFAULT_FAMILIES: Record<string, readonly string[]> = {
	text: ["text", "txt", "fg", "foreground", "ink", "label", "copy"],
	background: ["bg", "background", "backdrop", "surface", "fill"],
	link: ["link", "anchor"],
	focus: ["focus", "ring"],
};

// Expected palette slot per family (slot map keys).
export const EXPECTED_SLOT: Record<string, string> = {
	text: "text",
	background: "background",
	link: "link",
	focus: "focus",
};

// Monitored contradictions: name family → slots whose emitted value
// triggers a warning. Deliberately conservative (a text token that equals
// the BACKGROUND color is suspect; a text token that equals the link color
// isn't necessarily).
export const DEFAULT_CONTRADICTIONS: Record<string, readonly string[]> = {
	text: ["background"],
	background: ["text"],
	link: ["background"],
	focus: ["background"],
};

// Package-level waivers: tokens of the package's own role API that are
// legitimately "contradictory". Site-specific waivers are the consumer's
// (append yours — every entry must be justified).
export const defaultHcWaivers: readonly HcWaiver[] = [
	{
		pattern: /^--fg-on-/,
		reason:
			"text sitting ON a colored block (accent/emphasis): the ink legitimately equals the page background color",
	},
	{
		pattern: /-inverse(-|$)/,
		reason:
			"deliberately INVERTED block — the inversion is declared in the name",
	},
	{
		pattern: /^--bg-emphasis-strong$/,
		reason:
			"strong emphasis surface = block inverted by design (text sitting on it: --fg-on-emphasis)",
	},
];

/** Best-effort slot derivation from the emitted role variables. Note the
 *  known imprecision: `--focus-ring` may be wired to the link color in HC
 *  themes while the HC color map's `focus` slot differs — pass explicit
 *  slots (mirroring your HC map) when you need exactness. */
export function deriveHcSlots(vars: HcThemeVars): HcSlots {
	const roleFor: Record<string, string> = {
		background: "--bg-base",
		text: "--fg-base",
		link: "--link",
		focus: "--focus-ring",
	};
	const slots: HcSlots = {};
	for (const [slot, role] of Object.entries(roleFor)) {
		const value = vars.get(role);
		if (value !== undefined) slots[slot] = value.trim().toLowerCase();
	}
	return slots;
}

/** Splits a custom property name into segments: --color-header-bg →
 *  ["color", "header", "bg"] */
export function segments(name: string): string[] {
	return name.replace(/^--/, "").split(/[-_]/).filter(Boolean);
}

/** Semantic family of a name — the LAST recognized segment wins (in the
 *  suffixed convention, the last word states the role: header-blog-link-bg
 *  is a background, not a link). Returns null if no segment is recognized. */
export function familyOf(
	name: string,
	families: Record<string, readonly string[]> = DEFAULT_FAMILIES,
): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const [family, words] of Object.entries(families)) {
			if (words.includes(segs[i])) return family;
		}
	}
	return null;
}

/** Pairing base: the name stripped of its family segment, wherever it is
 *  (--color-footer-bg → "color-footer"; --color-lang-toggle-bg-activated →
 *  "color-lang-toggle-activated"). The "on-" prefix is also stripped:
 *  --fg-on-emphasis pairs with --bg-emphasis (text sitting on that block). */
export function pairBase(
	name: string,
	families: Record<string, readonly string[]> = DEFAULT_FAMILIES,
): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const words of Object.values(families)) {
			if (words.includes(segs[i])) {
				const rest = [...segs.slice(0, i), ...segs.slice(i + 1)];
				// --fg-ON-emphasis: "on" means "sitting on" → same base as
				// the matching block
				if (rest[i] === "on") rest.splice(i, 1);
				return rest.join("-");
			}
		}
	}
	return null;
}

export function runHcSemanticAudit(options: HcAuditOptions): HcAuditFinding[] {
	const families = options.families ?? DEFAULT_FAMILIES;
	const contradictions = options.contradictions ?? DEFAULT_CONTRADICTIONS;
	const waivers = options.waivers ?? defaultHcWaivers;
	const slotsFor =
		options.slotsFor ?? ((_theme: string, vars: HcThemeVars) => deriveHcSlots(vars));

	const findings: HcAuditFinding[] = [];

	for (const theme of options.themes) {
		const vars = options.varsFor(theme);
		const slots = vars ? slotsFor(theme, vars) : undefined;
		if (!vars || !slots) continue;

		// 1. Gather component PAIRS (same base, text + bg families). A
		// block can be legitimately inverted (black footer on white page):
		// the truth of a pair lies in the pair, not in the theme's global
		// slots.
		const pairs = new Map<
			string,
			{ text?: [string, string]; background?: [string, string] }
		>();
		for (const [name, value] of vars) {
			const family = familyOf(name, families);
			if (family !== "text" && family !== "background") continue;
			const base = pairBase(name, families);
			if (base === null) continue;
			const entry = pairs.get(base) ?? {};
			entry[family] = [name, value.trim().toLowerCase()];
			pairs.set(base, entry);
		}

		const paired = new Set<string>();
		for (const entry of pairs.values()) {
			if (entry.text && entry.background) {
				paired.add(entry.text[0]);
				paired.add(entry.background[0]);
				// Pair check: text == background → invisible text.
				if (entry.text[1] === entry.background[1]) {
					const waiver = waivers.find((w) => w.pattern.test(entry.text![0]));
					findings.push({
						theme,
						name: `${entry.text[0]} + ${entry.background[0]}`,
						value: entry.text[1],
						family: "pair",
						conflictingSlot: "text identical to background (invisible)",
						waived: waiver ? waiver.reason : null,
					});
				}
			}
		}

		// 2. Global name↔slot rule — ONLY for orphan tokens (with no pair
		// half): there, with no local context, the theme's slots are the
		// only reference.
		for (const [name, value] of vars) {
			if (paired.has(name)) continue;
			const family = familyOf(name, families);
			if (!family) continue;
			const norm = value.trim().toLowerCase();

			for (const slot of contradictions[family] ?? []) {
				if (norm === slots[slot] && norm !== slots[EXPECTED_SLOT[family]]) {
					const waiver = waivers.find((w) => w.pattern.test(name));
					findings.push({
						theme,
						name,
						value: norm,
						family,
						conflictingSlot: slot,
						waived: waiver ? waiver.reason : null,
					});
				}
			}
		}
	}
	return findings;
}

/** Markdown report, same shape for every consumer. `commandLabel` is the
 *  command shown in the header (e.g. "pnpm hc:audit" or
 *  "darkmode-plus-a11y audit"). */
export function formatHcAuditReport(
	findings: HcAuditFinding[],
	commandLabel: string,
): string {
	const active = findings.filter((f) => !f.waived);
	const waived = findings.filter((f) => f.waived);
	const lines: string[] = [
		"<!-- @format -->",
		"",
		"# High-contrast semantic audit",
		"",
		`Artifact generated by \`${commandLabel}\` — do not edit by hand.`,
		"READ-ONLY control: variable names decide no color (the layer-2 wiring",
		"decides that); they act as inspectors. A warning means \"the name",
		"suggests a family, the emitted value contradicts it\" — to verify,",
		"never blocking.",
		"",
		`## Active warnings: ${active.length}`,
		"",
	];
	if (active.length === 0) {
		lines.push(
			"None. Every semantic name is consistent with its emitted",
			"value (or covered by a justified waiver).",
			"",
		);
	} else {
		for (const f of active) {
			lines.push(
				`- ⚠️ \`${f.name}\` (${f.theme}): named "${f.family}" but emits` +
					` \`${f.value}\` (= slot ${f.conflictingSlot}) — check the wiring`,
			);
		}
		lines.push("");
	}
	lines.push(`## Waivers (legitimate contradictions): ${waived.length}`, "");
	const seen = new Set<string>();
	for (const f of waived) {
		const key = `${f.name}|${f.waived}`;
		if (seen.has(key)) continue;
		seen.add(key);
		lines.push(`- \`${f.name}\` — ${f.waived}`);
	}
	lines.push("");
	return lines.join("\n");
}
