/** @format */

import { compile } from "sass";
import postcss from "postcss";
import path from "node:path";

import { THEMES, type ThemeOption } from "../../config/themes";

export type ThemeVars = Map<string, string>;
export type ThemeVarsMap = Map<ThemeOption, ThemeVars>;

const MAIN_SCSS = path.resolve(__dirname, "../../styles/main.scss");

// Matches the *bare* `[data-theme="x"]` selector emitted by
// generate-theme-css-vars() — never a descendant selector like
// `[data-theme="dark"] .header__title-name`, which carries no custom
// properties of its own. Dart Sass drops quotes around identifier-safe
// attribute values, so both `[data-theme="x"]` and `[data-theme=x]` forms
// are accepted.
const THEME_SELECTOR = /^\[data-theme=(?:"([^"]*)"|'([^']*)'|([^\]"'\s]+))\]$/;

function parseThemeSelector(selector: string): string | null {
	const match = THEME_SELECTOR.exec(selector.trim());
	if (!match) return null;
	return match[1] ?? match[2] ?? match[3] ?? null;
}

function collectCustomProps(rule: postcss.Rule): ThemeVars {
	const vars: ThemeVars = new Map();
	rule.walkDecls((decl) => {
		if (decl.prop.startsWith("--")) {
			vars.set(decl.prop, decl.value);
		}
	});
	return vars;
}

type Extracted = {
	css: string;
	themeVars: ThemeVarsMap;
	rootVars: ThemeVars;
};

function compileAndExtract(): Extracted {
	const result = compile(MAIN_SCSS, { style: "expanded" });
	const root = postcss.parse(result.css);

	const themeVars: ThemeVarsMap = new Map();
	const rootVars: ThemeVars = new Map();

	root.walkRules((rule) => {
		const selector = rule.selector.trim();

		// The default (light) theme custom properties live in the top-level
		// :root block emitted by _theme-system.scss — but other components
		// (e.g. _scroll-progress.scss) also declare their own unrelated
		// `:root { --foo: ...; }` rules. Merge them all, later declarations
		// winning on conflicts, exactly like the browser cascade would; this
		// is what "the custom properties of :root" means. The
		// `@media (prefers-color-scheme: dark)` variant uses the different
		// selector string `:root:not([data-theme])`, so it's naturally
		// excluded here.
		if (selector === ":root") {
			for (const [prop, value] of collectCustomProps(rule)) {
				rootVars.set(prop, value);
			}
			return;
		}

		const themeName = parseThemeSelector(selector);
		if (!themeName) return;

		const vars = collectCustomProps(rule);
		if (vars.size === 0) return;
		themeVars.set(themeName as ThemeOption, vars);
	});

	for (const theme of THEMES) {
		if (!themeVars.has(theme)) {
			throw new Error(
				`extract-themes: theme "${theme}" (declared in src/config/themes.ts) ` +
					`was not found as a [data-theme] block in the compiled CSS`,
			);
		}
	}

	return { css: result.css, themeVars, rootVars };
}

// Compiling Sass + parsing the resulting CSS is expensive; every caller
// within a single test run (or report generation) shares one compilation.
let cache: Extracted | null = null;

function getExtracted(): Extracted {
	if (!cache) {
		cache = compileAndExtract();
	}
	return cache;
}

export function getCompiledCss(): string {
	return getExtracted().css;
}

export function getThemeVars(): ThemeVarsMap {
	return getExtracted().themeVars;
}

export function getRootVars(): ThemeVars {
	return getExtracted().rootVars;
}

export function getVar(theme: ThemeOption, name: string): string {
	const vars = getThemeVars().get(theme);
	if (!vars) {
		throw new Error(`getVar: unknown theme "${theme}"`);
	}
	const value = vars.get(name);
	if (value === undefined) {
		throw new Error(
			`getVar: custom property "${name}" is not defined for theme "${theme}"`,
		);
	}
	return value;
}
