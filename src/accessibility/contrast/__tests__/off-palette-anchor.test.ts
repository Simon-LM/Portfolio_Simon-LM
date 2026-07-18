/** @jest-environment node */
/** @format */

import { compileString } from "sass";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The off-palette anchor mechanism lives in Sass (_theme-utils.scss:
// oklch-distance, the extended analyze-tailwind-color, and its two callers
// auto-dark-transform/remap-for-cvd). These tests compile small probes that
// exercise it directly (PLAN-off-palette-anchor.md phase 4), since none of
// the portfolio's own 15 themes use an off-palette primitive — the branches
// under test never fire from the portfolio's own compiled CSS.

const projectRoot = path.resolve(__dirname, "../../../..");

function compileProbe(body: string): { css: string; warnings: string[] } {
	const warnings: string[] = [];
	const src =
		`@use "sass:map";\n` +
		`@use "sass:color";\n` +
		`@use "darkmode-plus-a11y/scss/base-palette" as *;\n` +
		`@use "darkmode-plus-a11y/scss/theme-utils" as tu;\n` +
		`a { ${body} }`;
	const result = compileString(src, {
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		url: pathToFileURL(path.join(projectRoot, "__off_palette_anchor_probe__.scss")),
		logger: {
			warn(message) {
				warnings.push(message);
			},
			debug() {},
		},
	});
	return { css: result.css, warnings };
}

function resolvedValue(css: string, prop: string): string {
	const re = new RegExp(`${prop}:\\s*([^;]+);`, "i");
	const match = re.exec(css);
	if (!match) throw new Error(`no ${prop} in probe output: ${css}`);
	return match[1].trim();
}

// A genuine Tailwind v3 hex swatch (red-600) — the "pasted a v3 hex" case
// the plan's silent threshold targets. Measured oklch-distance to v4's
// red-600 (2026-07-17 exhaustive calibration): 2.98, comfortably under the
// 3.75 threshold.
const V3_RED_600 = "#dc2626";

// A genuinely custom brand blue with no close Tailwind relative. Its true
// nearest palette entry, found by analyze-tailwind-color's exhaustive
// walk, is indigo-500 at distance 4.12 — comfortably over 3.75, so this is
// the "genuine custom color" case that should warn.
const CUSTOM_BRAND_BLUE = "#6866e9";

describe("oklch-distance", () => {
	it("is zero for a color against itself", () => {
		const { css } = compileProbe(`x: tu.oklch-distance(get-color("blue", 600), get-color("blue", 600));`);
		expect(resolvedValue(css, "x")).toBe("0");
	});

	it("is symmetric and positive for two distinct palette colors", () => {
		const { css: css1 } = compileProbe(`x: tu.oklch-distance(get-color("blue", 600), get-color("red", 600));`);
		const { css: css2 } = compileProbe(`x: tu.oklch-distance(get-color("red", 600), get-color("blue", 600));`);
		const d1 = parseFloat(resolvedValue(css1, "x"));
		const d2 = parseFloat(resolvedValue(css2, "x"));
		expect(d1).toBeGreaterThan(0);
		expect(d1).toBeCloseTo(d2, 6);
	});
});

describe("analyze-tailwind-color (extended: exact match)", () => {
	it("still returns found:true, distance:0 for a recognized palette color (regression guard)", () => {
		const { css } = compileProbe(
			`$a: tu.analyze-tailwind-color(get-color("emerald", 700));` +
				`x: "#{map.get($a, 'found')}|#{map.get($a, 'family')}|#{map.get($a, 'weight')}|#{map.get($a, 'distance')}";`,
		);
		expect(resolvedValue(css, "x")).toBe('"true|emerald|700|0"');
	});
});

describe("analyze-tailwind-color (extended: off-palette nearest-entry tracking)", () => {
	it("finds the nearest entry for a v3-hex-paste color, within the silent threshold", () => {
		const { css } = compileProbe(
			`$a: tu.analyze-tailwind-color(${V3_RED_600});` +
				`x: "#{map.get($a, 'found')}|#{map.get($a, 'nearest-family')}|#{map.get($a, 'nearest-weight')}";` +
				`d: #{map.get($a, 'distance')};`,
		);
		expect(resolvedValue(css, "x")).toBe('"false|red|600"');
		expect(parseFloat(resolvedValue(css, "d"))).toBeLessThan(tu_threshold());
	});

	it("finds the true nearest entry for a genuine custom brand color across the full 26x11 grid", () => {
		const { css } = compileProbe(
			`$a: tu.analyze-tailwind-color(${CUSTOM_BRAND_BLUE});` +
				`x: "#{map.get($a, 'found')}|#{map.get($a, 'nearest-family')}|#{map.get($a, 'nearest-weight')}";` +
				`d: #{map.get($a, 'distance')};`,
		);
		expect(resolvedValue(css, "x")).toBe('"false|indigo|500"');
		const distance = parseFloat(resolvedValue(css, "d"));
		expect(distance).toBeGreaterThan(tu_threshold());
		expect(distance).toBeCloseTo(4.12, 1);
	});
});

// Mirrors the calibrated constant in _theme-utils.scss (kept in sync
// manually — a change to $off-palette-same-color-threshold should be a
// deliberate, re-measured decision, not silently absorbed by this test).
function tu_threshold(): number {
	return 3.75;
}

describe("auto-dark-transform (off-palette anchor)", () => {
	const config = `("steps": 7, "adjustments": ())`;

	it("silently anchors a v3-hex-paste color to its nearest entry (no warning)", () => {
		const { css, warnings } = compileProbe(
			`x: tu.auto-dark-transform(${V3_RED_600}, "custom-role", ${config});`,
		);
		const { css: expectedCss } = compileProbe(
			`x: tu.auto-dark-transform(get-color("red", 600), "red-600", ${config});`,
		);
		expect(resolvedValue(css, "x")).toBe(resolvedValue(expectedCss, "x"));
		expect(warnings).toHaveLength(0);
	});

	it("anchors a genuine custom brand color with exactly one warning", () => {
		const { css, warnings } = compileProbe(
			`x: tu.auto-dark-transform(${CUSTOM_BRAND_BLUE}, "brand", ${config});`,
		);
		const { css: expectedCss } = compileProbe(
			`x: tu.auto-dark-transform(get-color("indigo", 500), "indigo-500", ${config});`,
		);
		expect(resolvedValue(css, "x")).toBe(resolvedValue(expectedCss, "x"));
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(/brand: off-palette color, anchored to indigo-500/);
		expect(warnings[0]).toMatch(/prefer a Tailwind primitive/);
	});

	it("closes the parked dark-mode gamut gap: the anchored result is always in-gamut", () => {
		// A saturated, off-palette custom color chosen to be far from any
		// palette entry (high chroma at a mid-lightness the old ±30-40% HSL
		// fallback would have pushed further, with no gamut guard at all —
		// see PLAN-off-palette-anchor.md's "what this fixes" section).
		const { css } = compileProbe(
			`$dark: tu.auto-dark-transform(oklch(55% 0.28 30deg), "vivid-custom", ${config});` +
				`x: color.is-in-gamut($dark, $space: rgb);`,
		);
		expect(resolvedValue(css, "x")).toBe("true");
	});
});

describe("remap-for-cvd (off-palette anchor)", () => {
	it("silently anchors a v3-hex-paste color and leaves it unchanged when the family is absent from family-remap (no warning)", () => {
		const config = `("family-remap": (), "severity": 1)`;
		const { css, warnings } = compileProbe(
			`x: tu.remap-for-cvd(${V3_RED_600}, "custom-role", ${config}, "deuteranopia");`,
		);
		// Family absent from the remap table: resolved is the input color
		// itself, upgraded to OKLCH — not silently substituted for the
		// anchor's own swatch (mirrors the recognized-color branch 3).
		const { css: expectedCss } = compileProbe(`x: color.to-space(${V3_RED_600}, oklch);`);
		expect(resolvedValue(css, "x")).toBe(resolvedValue(expectedCss, "x"));
		expect(warnings).toHaveLength(0);
	});

	it("anchors a genuine custom brand color through a configured family-remap, with exactly one warning", () => {
		// indigo is the custom color's nearest family (see the
		// analyze-tailwind-color test above); shift it by -2 weights
		// (500 -> 300) to exercise the same weight-shift branch a
		// recognized color would take.
		const config = `("family-remap": ("indigo": ("sky", -2)), "severity": 1)`;
		const { css, warnings } = compileProbe(
			`x: tu.remap-for-cvd(${CUSTOM_BRAND_BLUE}, "brand", ${config}, "deuteranopia");`,
		);
		const { css: expectedCss } = compileProbe(`x: get-color("sky", 300);`);
		expect(resolvedValue(css, "x")).toBe(resolvedValue(expectedCss, "x"));
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(/brand: off-palette color, anchored to indigo-500/);
	});
});
