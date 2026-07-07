/** @format */

import { THEMES } from "./themes";

// Génère la chaîne du script anti-FOUC inline (beforeInteractive) : lit
// localStorage.theme (validé contre la liste), sinon prefers-color-scheme,
// et pose data-theme AVANT le premier paint. Extrait tel quel du layout du
// portfolio (E4 phase 3) — la chaîne générée est byte-identique au littéral
// historique, oracle vérifié au commit.
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
