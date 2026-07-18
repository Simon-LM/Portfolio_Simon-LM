/** @jest-environment node */
/** @format */

import { compileString } from "sass";
import path from "node:path";
import { pathToFileURL } from "node:url";

// generate-all-themes' per-theme engine overrides ($configs): each entry
// is a PARTIAL config deep-merged over that theme's defaults. These tests
// compile small probes proving (1) the override reaches the engine, (2)
// the deep merge preserves the default entries the override doesn't
// touch, and (3) the typo/no-config guards warn.

const projectRoot = path.resolve(__dirname, "../../../..");

function compileProbe(body: string): { css: string; warnings: string[] } {
	const warnings: string[] = [];
	const src =
		`@use "darkmode-plus-a11y/scss/base-palette" as *;\n` +
		`@use "darkmode-plus-a11y/scss/theme-generator" as tg;\n` +
		body;
	const result = compileString(src, {
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		url: pathToFileURL(path.join(projectRoot, "__generator_config_probe__.scss")),
		logger: {
			warn(message) {
				warnings.push(message);
			},
			debug() {},
		},
	});
	return { css: result.css, warnings };
}

// Extracts one custom property's value from a theme block.
function themeVar(css: string, theme: string, prop: string): string {
	// Sass serializes the attribute selector without quotes.
	const block = new RegExp(
		`\\[data-theme="?${theme}"?\\]\\s*\\{([\\s\\S]*?)\\n\\}`,
	).exec(css);
	if (!block) throw new Error(`no [data-theme="${theme}"] block in: ${css}`);
	const decl = new RegExp(`${prop}:\\s*([^;]+);`).exec(block[1]);
	if (!decl) throw new Error(`no ${prop} in ${theme} block: ${block[1]}`);
	return decl[1].trim();
}

// Serialized value of a palette entry, for comparing against emitted vars.
function paletteValue(family: string, weight: number): string {
	const { css } = compileProbe(`a { x: get-color("${family}", ${weight}); }`);
	const match = /x:\s*([^;]+);/.exec(css);
	if (!match) throw new Error(`no palette value in: ${css}`);
	return match[1].trim();
}

const emitBody = (themes: string, configs = "()") =>
	`@include tg.generate-all-themes((${themes}), $configs: ${configs}) using ($name) {\n` +
	`\t@include tg.emit-role-vars();\n` +
	`}`;

describe("generate-all-themes $configs (per-theme engine overrides)", () => {
	it("control: tritanopia defaults remap accent amber->orange and link sky->violet", () => {
		const { css, warnings } = compileProbe(emitBody(`"tritanopia",`));
		expect(themeVar(css, "tritanopia", "--accent")).toBe(paletteValue("orange", 300));
		expect(themeVar(css, "tritanopia", "--link")).toBe(paletteValue("violet", 900));
		expect(warnings).toHaveLength(0);
	});

	it("applies a CVD family-remap override AND keeps the default entries (deep merge)", () => {
		const configs = `("tritanopia": ("family-remap": ("sky": ("teal", 0))))`;
		const { css, warnings } = compileProbe(emitBody(`"tritanopia",`, configs));
		// Overridden entry: link (sky-900) now remaps to teal-900.
		expect(themeVar(css, "tritanopia", "--link")).toBe(paletteValue("teal", 900));
		// Untouched default entry survives: accent (amber-300) still
		// remaps to orange-300 — a shallow merge would have lost it.
		expect(themeVar(css, "tritanopia", "--accent")).toBe(paletteValue("orange", 300));
		expect(warnings).toHaveLength(0);
	});

	it("applies a dark adjustments override without disturbing the other defaults", () => {
		const { css: controlCss } = compileProbe(emitBody(`"dark",`));
		const configs = `("dark": ("adjustments": ("link": 2)))`;
		const { css, warnings } = compileProbe(emitBody(`"dark",`, configs));
		expect(themeVar(css, "dark", "--link")).not.toBe(
			themeVar(controlCss, "dark", "--link"),
		);
		expect(themeVar(css, "dark", "--gray-50")).toBe(
			themeVar(controlCss, "dark", "--gray-50"),
		);
		expect(warnings).toHaveLength(0);
	});

	it("extends a high-contrast variant's colors slot by slot (deep merge)", () => {
		const configs = `("high-contrast": ("colors": ("link": #123456)))`;
		const { css, warnings } = compileProbe(emitBody(`"high-contrast",`, configs));
		expect(themeVar(css, "high-contrast", "--link")).toBe("#123456");
		// The untouched text slot keeps the default yellow-on-black value.
		expect(themeVar(css, "high-contrast", "--fg-base")).toBe("#ffff00");
		expect(warnings).toHaveLength(0);
	});

	it("warns about a $configs key that matches no requested theme (typo guard)", () => {
		const configs = `("tritanopa": ("family-remap": ("sky": ("teal", 0))))`;
		const { warnings } = compileProbe(emitBody(`"tritanopia",`, configs));
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(/tritanopa.*matches no requested theme/);
	});

	it("warns when a config targets a theme that takes none (light)", () => {
		const configs = `("light": ("steps": 1))`;
		const { warnings } = compileProbe(emitBody(`"light",`, configs));
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(/light.*takes no configuration/);
	});
});
