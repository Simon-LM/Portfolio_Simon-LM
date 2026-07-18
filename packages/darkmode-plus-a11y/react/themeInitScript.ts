/** @format */

import { THEMES } from "./themes";

// Generates the inline anti-FOUC script string (beforeInteractive): reads
// localStorage.theme (validated against the list), otherwise
// prefers-color-scheme, and sets data-theme BEFORE first paint.
export function themeInitScript(themes: readonly string[] = THEMES): string {
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
						}
					} catch (e) {}
				})();
			  `;
}
