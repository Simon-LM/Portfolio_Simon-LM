/** @jest-environment node */
/** @format */

import { getThemeVars, getRootVars, getVar } from "darkmode-plus-a11y/testing/extract-themes";
import { THEMES } from "../../../config/themes";

describe("getThemeVars", () => {
	it("finds a [data-theme] block for every theme in the single source of truth", () => {
		const themeVars = getThemeVars();
		for (const theme of THEMES) {
			expect(themeVars.has(theme)).toBe(true);
			expect(themeVars.get(theme)!.size).toBeGreaterThan(50);
		}
	});

	it("collects only custom properties, never plain declarations", () => {
		const light = getThemeVars().get("light")!;
		for (const prop of light.keys()) {
			expect(prop.startsWith("--")).toBe(true);
		}
	});
});

describe("getRootVars vs [data-theme=\"light\"] (consistency guard)", () => {
	it("agrees with the explicit light theme block on every theme custom property", () => {
		// :root also carries a handful of component-local custom properties
		// unrelated to theming (e.g. _scroll-progress.scss); this guard only
		// asserts that wherever :root and [data-theme="light"] overlap
		// (the theme tokens), their values are identical — not that :root is
		// nothing but theme tokens.
		const rootVars = getRootVars();
		const lightVars = getThemeVars().get("light")!;

		expect(rootVars.size).toBeGreaterThan(0);
		expect(lightVars.size).toBeGreaterThan(0);

		for (const [prop, value] of lightVars) {
			expect(rootVars.get(prop)).toBe(value);
		}
	});
});

describe("getVar", () => {
	it("returns a known value for a known theme/property pair", () => {
		// high-contrast is a fixed, hand-verifiable palette (README §2).
		expect(getVar("high-contrast", "--color-main-bg")).toBe("#000000");
	});

	it("throws for an unknown theme", () => {
		// theme is typed `string` on the package side (generic); the check is
		// now runtime-only.
		expect(() => getVar("not-a-theme", "--fg-base")).toThrow(/unknown theme/);
	});

	it("throws for an unknown custom property", () => {
		expect(() => getVar("light", "--definitely-not-a-real-token")).toThrow(
			/is not defined/,
		);
	});
});
