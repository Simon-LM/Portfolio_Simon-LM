/** @jest-environment node */
/** @format */

import { compileString } from "sass";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The dark engine shifts each weight AWAY from its own end of the rail (a
// light weight darkens, a dark weight lightens, 500 stays put). Two
// properties of that shift are contractual and easy to regress:
//
// 1. `adjustments` signs read the same on both sides of the pivot — +N
//    toward the dark end, -N toward the light end. They used to be added to
//    $steps, so their meaning silently inverted above the pivot.
// 2. Roles that must stay distinct (link / link-hover) are re-seated as a
//    pair rather than each clamping onto the same rail end. A collapsed pair
//    is invisible to the contrast suite: both values are readable, only the
//    difference between them is gone.

const projectRoot = path.resolve(__dirname, "../../../..");

const PRIMITIVES = (link: string, linkHover: string, family = "indigo") =>
	`"accent": ("${family}", 300), "accent-strong": ("${family}", 500), ` +
	`"accent-ink": ("${family}", 950), "accent-soft": ("${family}", 100), ` +
	`${link}, ${linkHover}, ` +
	`"success": ("emerald", 700), "danger": ("red", 600)`;

function compileDark(
	primitives: string,
	configs = "()",
): { css: string; warnings: string[] } {
	const warnings: string[] = [];
	const src =
		`@use "darkmode-plus-a11y/scss/state" as st with (\n` +
		`\t$gray-family: "slate",\n` +
		`\t$primitives: (${primitives})\n` +
		`);\n` +
		`@use "darkmode-plus-a11y/scss/base-palette" as *;\n` +
		`@use "darkmode-plus-a11y/scss/theme-generator" as tg;\n` +
		`@include tg.generate-all-themes(("dark",), $configs: ${configs}) using ($name) {\n` +
		`\t@include tg.emit-role-vars();\n` +
		`}`;
	const result = compileString(src, {
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		url: pathToFileURL(path.join(projectRoot, "__dark_shift_probe__.scss")),
		logger: {
			warn(message) {
				warnings.push(message);
			},
			debug() {},
		},
	});
	return { css: result.css, warnings };
}

function darkVar(css: string, prop: string): string {
	const block = /\[data-theme="?dark"?\]\s*\{([\s\S]*?)\n\}/.exec(css);
	if (!block) throw new Error(`no dark block in: ${css}`);
	const decl = new RegExp(`${prop}:\\s*([^;]+);`).exec(block[1]);
	if (!decl) throw new Error(`no ${prop} in dark block: ${block[1]}`);
	return decl[1].trim();
}

// Serialized value of a palette entry, for comparing against emitted vars.
function paletteValue(family: string, weight: number): string {
	const { css } = compileString(
		`@use "darkmode-plus-a11y/scss/base-palette" as *;\n` +
			`a { x: get-color("${family}", ${weight}); }`,
		{ loadPaths: [projectRoot, path.join(projectRoot, "node_modules")] },
	);
	const match = /x:\s*([^;]+);/.exec(css);
	if (!match) throw new Error(`no palette value in: ${css}`);
	return match[1].trim();
}

describe("dark shift — adjustment sign is pivot-independent", () => {
	// link sits ABOVE the pivot (indigo-800), so the base shift lightens it.
	// Before the fix, a positive adjustment lightened it FURTHER; the public
	// contract now says positive always means "toward the dark end".
	const above = PRIMITIVES(`"link": ("indigo", 800)`, `"link-hover": ("sky", 800)`);

	it("moves a role above the pivot toward the dark end for +N", () => {
		const control = darkVar(compileDark(above).css, "--link");
		const plus = darkVar(
			compileDark(above, `("dark": ("adjustments": ("link": 2)))`).css,
			"--link",
		);
		// indigo-800 (index 9) - 7 steps = indigo-100; +2 lands on indigo-300.
		expect(control).toBe(paletteValue("indigo", 100));
		expect(plus).toBe(paletteValue("indigo", 300));
	});

	it("moves a role above the pivot toward the light end for -N", () => {
		const minus = darkVar(
			compileDark(above, `("dark": ("adjustments": ("link": -1)))`).css,
			"--link",
		);
		expect(minus).toBe(paletteValue("indigo", 50));
	});

	it("moves a role below the pivot in the SAME direction for the same sign", () => {
		// gray-200 (slate-200, index 3) is below the pivot: the base shift
		// darkens it. Same signs, same visual direction as the role above.
		const base = PRIMITIVES(
			`"link": ("indigo", 800)`,
			`"link-hover": ("sky", 800)`,
		);
		const plus = darkVar(
			compileDark(base, `("dark": ("adjustments": ("gray-200": 1)))`).css,
			"--gray-200",
		);
		const minus = darkVar(
			compileDark(base, `("dark": ("adjustments": ("gray-200": -2)))`).css,
			"--gray-200",
		);
		// index 3 + 7 steps = slate-900; +1 -> slate-950, -2 -> slate-700.
		expect(plus).toBe(paletteValue("slate", 950));
		expect(minus).toBe(paletteValue("slate", 700));
	});
});

describe("dark shift — link/link-hover survive as a distinguishable pair", () => {
	it("keeps two neighboring weights apart instead of stacking them on the rail end", () => {
		// indigo-600 and indigo-700 both overshoot the light end of the rail:
		// clamped one by one they would BOTH land on indigo-50, leaving the
		// hover state identical to the link.
		const { css, warnings } = compileDark(
			PRIMITIVES(`"link": ("indigo", 600)`, `"link-hover": ("indigo", 700)`),
		);
		const link = darkVar(css, "--link");
		const hover = darkVar(css, "--link-hover");
		expect(link).not.toBe(hover);
		expect(link).toBe(paletteValue("indigo", 50));
		expect(hover).toBe(paletteValue("indigo", 100));
		expect(warnings).toHaveLength(0);
	});

	it("does not invent a difference when the light theme declares one color", () => {
		// Same weight for both roles is a deliberate choice, not a collision.
		const { css } = compileDark(
			PRIMITIVES(`"link": ("indigo", 600)`, `"link-hover": ("indigo", 600)`),
		);
		expect(darkVar(css, "--link")).toBe(darkVar(css, "--link-hover"));
	});

	it("leaves a pair that does not collapse exactly where the shift puts it", () => {
		// The package defaults (sky-900 / sky-800) land clear of the rail end,
		// so the pair logic must be a no-op for them.
		const { css } = compileDark(
			PRIMITIVES(`"link": ("sky", 900)`, `"link-hover": ("sky", 800)`),
		);
		expect(darkVar(css, "--link")).toBe(paletteValue("sky", 200));
		expect(darkVar(css, "--link-hover")).toBe(paletteValue("sky", 100));
	});

	it("does not re-seat a pair whose roles come from different families", () => {
		// Different hues are already distinguishable; moving a weight there
		// would be an unrequested visual change.
		const { css } = compileDark(
			PRIMITIVES(`"link": ("indigo", 600)`, `"link-hover": ("teal", 700)`),
		);
		expect(darkVar(css, "--link")).toBe(paletteValue("indigo", 50));
		expect(darkVar(css, "--link-hover")).toBe(paletteValue("teal", 50));
	});
});
