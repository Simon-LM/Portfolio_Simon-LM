/** @format */

// Extraction des variables de thème (chantier E6.6, extrait du site).
// GÉNÉRIQUE : le consommateur passe SON point d'entrée SCSS, ses loadPaths
// et sa liste de thèmes via configureThemeExtraction(). Le vérificateur
// compile ce SCSS et lit les custom properties de chaque bloc [data-theme].

import { compile } from "sass";
import postcss from "postcss";

export type ThemeVars = Map<string, string>;
export type ThemeVarsMap = Map<string, ThemeVars>;

export type ThemeExtractionConfig = {
	/** Chemin absolu du SCSS d'entrée (celui qui émet les blocs [data-theme]). */
	entry: string;
	/** loadPaths Sass (ex. node_modules pour résoudre le paquet). */
	loadPaths?: string[];
	/** Thèmes attendus — l'extraction échoue si l'un manque. */
	themes: readonly string[];
};

let config: ThemeExtractionConfig | null = null;

// À appeler UNE fois par le consommateur (avant tout getVar/getThemeVars),
// typiquement au chargement de son module de contrastes ou en setup Jest.
export function configureThemeExtraction(next: ThemeExtractionConfig): void {
	config = next;
	cache = null;
}

function requireConfig(): ThemeExtractionConfig {
	if (!config) {
		throw new Error(
			"extract-themes : appelez configureThemeExtraction({ entry, loadPaths, themes }) d'abord.",
		);
	}
	return config;
}

// Matche le sélecteur [data-theme="x"] NU (jamais un descendant comme
// [data-theme="dark"] .header). Dart Sass retire les guillemets autour des
// valeurs identifiantes, donc les deux formes sont acceptées.
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
	const cfg = requireConfig();
	const result = compile(cfg.entry, {
		style: "expanded",
		loadPaths: cfg.loadPaths ?? [],
	});
	const root = postcss.parse(result.css);

	const themeVars: ThemeVarsMap = new Map();
	const rootVars: ThemeVars = new Map();

	root.walkRules((rule) => {
		const selector = rule.selector.trim();

		// Le thème par défaut (light) vit dans le :root de tête ; d'autres
		// composants déclarent aussi des :root { --foo } sans rapport. On les
		// fusionne (la dernière déclaration gagne, comme la cascade). Le variant
		// @media utilise :root:not([data-theme]), donc naturellement exclu.
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

// Compiler Sass + parser le CSS est coûteux ; un seul run partagé par tous
// les appelants (invalidé par configureThemeExtraction).
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
