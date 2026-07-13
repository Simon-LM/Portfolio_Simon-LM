/** @format */

// VALUE-based control for high contrast (hc-mécanique chantier, phase 2 —
// decision 2026-07-11). Principle: in high-contrast mode, EVERY emitted
// color must belong to the theme's palette. Catches any layer-3 token not
// wired to a layer-2 role (a raw value), whatever its name — this is the
// mechanical guarantee of the "layer 3 is defined from the roles"
// contract. Read-only: this test modifies nothing.

import { THEMES } from "../../../config/themes";
import { getThemeVars } from "a11y-prefs/testing/extract-themes";

// Per-variant palettes — MIRROR of src/styles/themes/_high-contrast*.scss
// (if a map changes there, this test fails: that's intentional, it forces
// a conscious update of the mirror).
const HC_PALETTES: Record<string, readonly string[]> = {
	"high-contrast": [
		"#000000", // background
		"#ffff00", // text
		"#00ffff", // link
		"#bfff00", // highlight
		"#ffffff", // action / focus
		"#00ff00", // success
		"#ff0000", // error
	],
	"high-contrast-green": [
		"#000000",
		"#00ff00", // text (and success)
		"#00ffff",
		"#ffff00", // highlight
		"#ffffff",
		"#ff0000",
	],
	"high-contrast-white": [
		"#000000",
		"#ffffff", // text (and fallback action: focus)
		"#00ffff",
		"#ffff00", // highlight + action
		"#00ff00",
		"#ff0000",
	],
	"high-contrast-paper": [
		"#ffffff", // background
		"#000000", // text / action / focus
		"#000099", // link
		"#ffff00", // highlight
		"#007700", // success
		"#cc0000", // error
	],
};

// Waivers: tokens legitimately outside the palette, each with its reason.
// Any new entry must be justified (a decision to make).
const WAIVED_PREFIXES: readonly { prefix: string; reason: string }[] = [
	{
		prefix: "--constant-",
		reason:
			"constants deliberately independent of the theme — their name declares it",
	},
];

/** #abc → #aabbcc, lowercase; null if not a hex value. */
function normalizeHex(value: string): string | null {
	const m = value
		.trim()
		.toLowerCase()
		.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
	if (!m) return null;
	let h = m[1];
	if (h.length === 3)
		h = h
			.split("")
			.map((c) => c + c)
			.join("");
	return `#${h}`;
}

/** rgba(255, 255, 0, 0.9) → #ffff00 (alpha is tolerated: the HUE must
 *  stay within the palette); null if not a simple rgb/rgba value. */
function rgbaToHex(value: string): string | null {
	const m = value
		.trim()
		.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
	if (!m) return null;
	const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
	return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

function isWaived(name: string): boolean {
	return WAIVED_PREFIXES.some((w) => name.startsWith(w.prefix));
}

const hcThemes = THEMES.filter((t) => t.startsWith("high-contrast"));

describe("high-contrast palette conformance (value-based control)", () => {
	it("each high-contrast* theme has its mirror palette in this test", () => {
		for (const theme of hcThemes) {
			expect(HC_PALETTES[theme]).toBeDefined();
		}
	});

	it.each(hcThemes)(
		"%s: every emitted color belongs to the palette (or is waived)",
		(theme) => {
			const vars = getThemeVars().get(theme);
			expect(vars).toBeDefined();
			const palette = new Set(HC_PALETTES[theme]);
			const violations: string[] = [];

			for (const [name, value] of vars!) {
				if (isWaived(name)) continue;
				const hex = normalizeHex(value) ?? rgbaToHex(value);
				if (hex === null) continue; // not a simple color (sizes, etc.)
				if (!palette.has(hex)) {
					violations.push(`${name}: ${value}`);
				}
			}

			expect(violations).toEqual([]);
		},
	);

	it("waivers match tokens that still exist (anti-zombie)", () => {
		const vars = getThemeVars().get("high-contrast");
		expect(vars).toBeDefined();
		for (const w of WAIVED_PREFIXES) {
			const alive = [...vars!.keys()].some((name) =>
				name.startsWith(w.prefix),
			);
			expect(alive).toBe(true);
		}
	});
});
