/** @format */

import "./setup";

// SEMANTIC inspector for high contrast (hc-mécanique chantier, phase 3 —
// decision 2026-07-11). This is the original name-based design (matching
// on words in variable names, widened to synonyms) recycled as a CONTROL:
// names no longer decide colors (the layer-2 wiring decides that), they
// monitor. If a token's name suggests a family (text, background, link,
// focus) and the emitted value contradicts it, a warning is emitted. Never
// blocking, never a modification — catches crossed wiring that happens to
// land inside the palette (the blind spot of value-based control).
//
// Usage: pnpm hc:audit  → console + docs/theme-system/HC-SEMANTIC-AUDIT.md

import * as fs from "node:fs";
import * as path from "node:path";
import { THEMES } from "../../config/themes";
import { getThemeVars } from "a11y-prefs/testing/extract-themes";

// Semantic families — synonyms a dev (or an AI) is likely to use in their
// layer-3 variable names. Matching happens on WHOLE SEGMENTS (split on -
// and _): "context" does not match "text".
const FAMILIES: Record<string, readonly string[]> = {
	text: ["text", "txt", "fg", "foreground", "ink", "label", "copy"],
	background: ["bg", "background", "backdrop", "surface", "fill"],
	link: ["link", "anchor"],
	focus: ["focus", "ring"],
};

// Expected palette slot per family (theme map keys).
const EXPECTED_SLOT: Record<string, string> = {
	text: "text",
	background: "background",
	link: "link",
	focus: "focus",
};

// Monitored contradictions: name family → slots whose emitted value
// triggers a warning. Deliberately conservative (a text token that equals
// the BACKGROUND color is suspect; a text token that equals the link color
// isn't necessarily).
const CONTRADICTIONS: Record<string, readonly string[]> = {
	text: ["background"],
	background: ["text"],
	link: ["background"],
	focus: ["background"],
};

// Slots per theme — MIRROR of src/styles/themes/_high-contrast*.scss.
const HC_SLOTS: Record<string, Record<string, string>> = {
	"high-contrast": {
		background: "#000000",
		text: "#ffff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-green": {
		background: "#000000",
		text: "#00ff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-white": {
		background: "#000000",
		text: "#ffffff",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-paper": {
		background: "#ffffff",
		text: "#000000",
		link: "#000099",
		focus: "#000000",
	},
};

// Tokens legitimately "contradictory", with their reason — typically text
// sitting ON a colored block (it logically takes an ink color = the page
// background color). Every new entry must be justified.
const WAIVERS: readonly { pattern: RegExp; reason: string }[] = [
	{
		pattern: /^--fg-on-/,
		reason:
			"text sitting ON a colored block (accent/emphasis): the ink legitimately equals the page background color",
	},
	{
		pattern: /^--color-header-text/,
		reason:
			"header text, sitting on the colored band (highlight): dark ink is legitimate",
	},
	{
		pattern: /^--color-lang-toggle-text-activated$/,
		reason: "active language button text, sitting on bg-emphasis (colored block)",
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
	{
		pattern: /^--color-collapse-bg-title$/,
		reason:
			"collapse title bar = inverted emphasis block (text sitting on it in dark ink)",
	},
];

/** Splits a custom property name into segments: --color-header-bg →
 *  ["color", "header", "bg"] */
export function segments(name: string): string[] {
	return name.replace(/^--/, "").split(/[-_]/).filter(Boolean);
}

/** Semantic family of a name — the LAST recognized segment wins (in the
 *  suffixed convention, the last word states the role: header-blog-link-bg
 *  is a background, not a link). Returns null if no segment is recognized. */
export function familyOf(name: string): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const [family, words] of Object.entries(FAMILIES)) {
			if (words.includes(segs[i])) return family;
		}
	}
	return null;
}

export type Finding = {
	theme: string;
	name: string;
	value: string;
	family: string;
	conflictingSlot: string;
	waived: string | null;
};

/** Pairing base: the name stripped of its family segment, wherever it is
 *  (--color-footer-bg → "color-footer"; --color-lang-toggle-bg-activated →
 *  "color-lang-toggle-activated"). The "on-" prefix is also stripped:
 *  --fg-on-emphasis pairs with --bg-emphasis (text sitting on that block). */
export function pairBase(name: string): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const words of Object.values(FAMILIES)) {
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

export function runAudit(): Finding[] {
	const findings: Finding[] = [];
	const hcThemes = THEMES.filter((t) => t.startsWith("high-contrast"));

	for (const theme of hcThemes) {
		const vars = getThemeVars().get(theme);
		const slots = HC_SLOTS[theme];
		if (!vars || !slots) continue;

		// 1. Gather component PAIRS (same base, text + bg families). A
		// block can be legitimately inverted (black footer on white page):
		// the truth of a pair lies in the pair, not in the theme's global
		// slots.
		const pairs = new Map<string, { text?: [string, string]; background?: [string, string] }>();
		for (const [name, value] of vars) {
			const family = familyOf(name);
			if (family !== "text" && family !== "background") continue;
			const base = pairBase(name);
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
					const waiver = WAIVERS.find((w) => w.pattern.test(entry.text![0]));
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
			const family = familyOf(name);
			if (!family) continue;
			const norm = value.trim().toLowerCase();

			for (const slot of CONTRADICTIONS[family] ?? []) {
				if (norm === slots[slot] && norm !== slots[EXPECTED_SLOT[family]]) {
					const waiver = WAIVERS.find((w) => w.pattern.test(name));
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

function formatReport(findings: Finding[]): string {
	const active = findings.filter((f) => !f.waived);
	const waived = findings.filter((f) => f.waived);
	const lines: string[] = [
		"<!-- @format -->",
		"",
		"# High-contrast semantic audit",
		"",
		"Artifact generated by `pnpm hc:audit` — do not edit by hand.",
		"READ-ONLY control: variable names decide no color (the layer-2 wiring",
		"decides that); they act as inspectors. A warning means \"the name",
		"suggests a family, the emitted value contradicts it\" — to verify,",
		"never blocking.",
		"",
		`## Active warnings: ${active.length}`,
		"",
	];
	if (active.length === 0) {
		lines.push("None. Every semantic name is consistent with its emitted",
			"value (or covered by a justified waiver).", "");
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

// Direct execution (tsx)
if (require.main === module) {
	const findings = runAudit();
	const active = findings.filter((f) => !f.waived);
	const report = formatReport(findings);
	const out = path.resolve(
		__dirname,
		"../../../docs/theme-system/HC-SEMANTIC-AUDIT.md",
	);
	fs.writeFileSync(out, report);
	for (const f of active) {
		console.warn(
			`⚠️  [hc-audit] ${f.theme} ${f.name}: named "${f.family}" but emits ${f.value} (slot ${f.conflictingSlot})`,
		);
	}
	console.log(
		`hc-audit: ${active.length} active warning(s), ${
			findings.length - active.length
		} waived — report: ${out}`,
	);
}
