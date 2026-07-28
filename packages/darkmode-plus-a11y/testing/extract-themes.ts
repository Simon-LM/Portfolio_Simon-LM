/** @format */

// Theme variable extraction. GENERIC: the consumer passes THEIR SCSS
// entry point, their loadPaths, and their theme list via
// configureThemeExtraction(). The verifier compiles this SCSS and reads
// the custom properties of each [data-theme] block.

import { existsSync } from "node:fs";
import { compile } from "sass";
import postcss from "postcss";

export type ThemeVars = Map<string, string>;
export type ThemeVarsMap = Map<string, ThemeVars>;

export type ThemeExtractionConfig = {
	/** Absolute path to the entry SCSS (the one that emits the [data-theme] blocks). */
	entry: string;
	/** Sass loadPaths (e.g. node_modules to resolve the package). */
	loadPaths?: string[];
	/** Expected themes — extraction fails if one is missing. */
	themes: readonly string[];
};

let config: ThemeExtractionConfig | null = null;

// To be called ONCE by the consumer (before any getVar/getThemeVars),
// typically when loading their contrast module or in Jest setup.
export function configureThemeExtraction(next: ThemeExtractionConfig): void {
	config = next;
	cache = null;
}

function requireConfig(): ThemeExtractionConfig {
	if (!config) {
		throw new Error(
			"extract-themes: call configureThemeExtraction({ entry, loadPaths, themes }) first.",
		);
	}
	return config;
}

// Matches the BARE [data-theme="x"] selector (never a descendant like
// [data-theme="dark"] .header). Dart Sass strips the quotes around
// identifier-like values, so both forms are accepted.
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

// Both failures below are the consumer's most likely mistakes: a wrong
// path, or a Sass error in their own stylesheet. Left unhandled, Dart
// Sass throws and the runtime prints its compiled-Dart stack — dozens of
// lines in which the one useful sentence is buried. Sass's own message
// is well formatted (source excerpt, line, column); the point here is to
// surface it instead of letting a stack trace bury it.
function compileAndExtract(): Extracted {
	const cfg = requireConfig();
	if (!existsSync(cfg.entry)) {
		throw new Error(
			`extract-themes: entry SCSS not found: ${cfg.entry}\n` +
				"Pass the path to the stylesheet that emits your [data-theme] blocks, " +
				"relative to where you run the command.",
		);
	}
	let result;
	try {
		result = compile(cfg.entry, {
			style: "expanded",
			loadPaths: cfg.loadPaths ?? [],
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new Error(
			`extract-themes: Sass failed to compile ${cfg.entry}\n\n${message}`,
		);
	}
	const root = postcss.parse(result.css);

	const themeVars: ThemeVarsMap = new Map();
	const rootVars: ThemeVars = new Map();

	root.walkRules((rule) => {
		const selector = rule.selector.trim();

		// The default theme (light) lives in the leading :root; other
		// components also declare unrelated :root { --foo } rules. These are
		// merged (last declaration wins, like the cascade). The @media
		// variant uses :root:not([data-theme]), so it's naturally excluded.
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
		themeVars.set(themeName, vars);
	});

	for (const theme of cfg.themes) {
		if (!themeVars.has(theme)) {
			throw new Error(
				`extract-themes: theme "${theme}" was not found as a [data-theme] block in the compiled CSS`,
			);
		}
	}

	return { css: result.css, themeVars, rootVars };
}

// Compiling Sass + parsing the CSS is expensive; a single run shared by
// every caller (invalidated by configureThemeExtraction).
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

export function getVar(theme: string, name: string): string {
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
