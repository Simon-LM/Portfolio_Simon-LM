/** @format */

import { THEMES } from "./themes";

// Typography preferences the script can restore alongside the theme. The
// keys and class names are NOT hardcoded here: they belong to the consumer
// (see the scaffolded accessibilityPreferences.ts), so the package stays
// agnostic about how a project names and wires its own preferences.
export type A11yInitOptions = {
	/** Dyslexia mode: key holding "true"/"false", and the class to restore. */
	dyslexia?: { key: string; className: string };
	/** Text size: key holding a percentage (100 = normal). Sets `--font-size-factor`. */
	fontSizeKey?: string;
	/** Accessibility font: key, and the value -> class map your SCSS emits. */
	font?: { key: string; classes: Readonly<Record<string, string>> };
};

// Anything restored AFTER hydration flashes: the page paints at the default
// first, then jumps. Harmless for a color, not for typography — someone
// reading at 200% sees a frame of text they cannot read, on every load. So
// every preference that changes how text is drawn belongs here, before the
// first paint, next to the theme.
function restoreTypography(options: A11yInitOptions): string {
	const lines: string[] = [];
	const at = (stmt: string) => lines.push(`\n\t\t\t\t\t\t${stmt}`);

	if (options.dyslexia) {
		const { key, className } = options.dyslexia;
		at(
			`if (localStorage.getItem(${JSON.stringify(key)}) === 'true') ` +
				`document.documentElement.classList.add(${JSON.stringify(className)});`,
		);
	}
	if (options.fontSizeKey) {
		at(
			`var savedSize = parseFloat(localStorage.getItem(${JSON.stringify(options.fontSizeKey)}));`,
		);
		at(
			"if (savedSize > 0) document.documentElement.style.setProperty('--font-size-factor', String(savedSize / 100));",
		);
	}
	if (options.font) {
		const { key, classes } = options.font;
		at(
			`var fontClasses = ${JSON.stringify(classes)}, savedFont = localStorage.getItem(${JSON.stringify(key)});`,
		);
		at(
			"if (savedFont && fontClasses[savedFont]) document.documentElement.classList.add(fontClasses[savedFont]);",
		);
	}
	return lines.join("");
}

// Generates the inline anti-FOUC script string (beforeInteractive): reads
// localStorage.theme (validated against the list), otherwise
// prefers-color-scheme, and sets data-theme BEFORE first paint. Pass
// `options` to restore the typography preferences in the same pass.
// Called without options the output is unchanged, so existing callers are
// untouched.
export function themeInitScript(
	themes: readonly string[] = THEMES,
	options: A11yInitOptions = {},
): string {
	return `
				(function() {
					try {
						var savedTheme = localStorage.getItem('theme');
						if (savedTheme && ${JSON.stringify(themes)}.includes(savedTheme)) {
							document.documentElement.setAttribute('data-theme', savedTheme);
						} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
							document.documentElement.setAttribute('data-theme', 'dark');
						} else {
							document.documentElement.setAttribute('data-theme', 'light');
						}${restoreTypography(options)}
					} catch (e) {}
				})();
			  `;
}
