/** @format */

// Contrôle par VALEUR du fort contraste (chantier hc-mécanique, phase 2 —
// décision Simon 2026-07-11). Principe : en mode fort contraste, TOUTE
// couleur émise doit appartenir à la palette du thème. Attrape tout token
// de couche 3 non branché sur un rôle de couche 2 (valeur brute), quel que
// soit son nom — c'est la garantie mécanique du contrat « la couche 3 se
// définit à partir des rôles ». Lecture seule : ce test ne modifie rien.

import { THEMES } from "../../../config/themes";
import { getThemeVars } from "../extract-themes";

// Palettes par variante — MIROIR de src/styles/themes/_high-contrast*.scss
// (si une carte change là-bas, ce test échoue : c'est voulu, il force la
// mise à jour consciente du miroir).
const HC_PALETTES: Record<string, readonly string[]> = {
	"high-contrast": [
		"#000000", // background
		"#ffff00", // text
		"#00ffff", // link
		"#bfff00", // highlight
		"#ffffff", // action / focus
		"#00ff00", // success
		"#ff0000", // error
	],
	"high-contrast-green": [
		"#000000",
		"#00ff00", // text (et success)
		"#00ffff",
		"#ffff00", // highlight
		"#ffffff",
		"#ff0000",
	],
	"high-contrast-white": [
		"#000000",
		"#ffffff", // text (et action de secours : focus)
		"#00ffff",
		"#ffff00", // highlight + action
		"#00ff00",
		"#ff0000",
	],
	"high-contrast-paper": [
		"#ffffff", // background
		"#000000", // text / action / focus
		"#000099", // link
		"#ffff00", // highlight
		"#007700", // success
		"#cc0000", // error
	],
};

// Waivers : tokens légitimement hors palette, chacun avec sa raison.
// Toute nouvelle entrée doit être argumentée (arbitrage Simon).
const WAIVED_PREFIXES: readonly { prefix: string; reason: string }[] = [
	{
		prefix: "--constant-",
		reason:
			"constantes volontairement indépendantes du thème — leur nom le déclare",
	},
];

/** #abc → #aabbcc, minuscules ; null si pas un hex. */
function normalizeHex(value: string): string | null {
	const m = value
		.trim()
		.toLowerCase()
		.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
	if (!m) return null;
	let h = m[1];
	if (h.length === 3)
		h = h
			.split("")
			.map((c) => c + c)
			.join("");
	return `#${h}`;
}

/** rgba(255, 255, 0, 0.9) → #ffff00 (l'alpha est tolérée : la TEINTE doit
 *  rester dans la palette) ; null si pas un rgb/rgba simple. */
function rgbaToHex(value: string): string | null {
	const m = value
		.trim()
		.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
	if (!m) return null;
	const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
	return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

function isWaived(name: string): boolean {
	return WAIVED_PREFIXES.some((w) => name.startsWith(w.prefix));
}

const hcThemes = THEMES.filter((t) => t.startsWith("high-contrast"));

describe("conformité à la palette du fort contraste (contrôle par valeur)", () => {
	it("chaque thème high-contrast* a sa palette miroir dans ce test", () => {
		for (const theme of hcThemes) {
			expect(HC_PALETTES[theme]).toBeDefined();
		}
	});

	it.each(hcThemes)(
		"%s : toute couleur émise appartient à la palette (ou est waivée)",
		(theme) => {
			const vars = getThemeVars().get(theme);
			expect(vars).toBeDefined();
			const palette = new Set(HC_PALETTES[theme]);
			const violations: string[] = [];

			for (const [name, value] of vars!) {
				if (isWaived(name)) continue;
				const hex = normalizeHex(value) ?? rgbaToHex(value);
				if (hex === null) continue; // pas une couleur simple (tailles, etc.)
				if (!palette.has(hex)) {
					violations.push(`${name}: ${value}`);
				}
			}

			expect(violations).toEqual([]);
		},
	);

	it("les waivers correspondent à des tokens qui existent encore (anti-zombie)", () => {
		const vars = getThemeVars().get("high-contrast");
		expect(vars).toBeDefined();
		for (const w of WAIVED_PREFIXES) {
			const alive = [...vars!.keys()].some((name) =>
				name.startsWith(w.prefix),
			);
			expect(alive).toBe(true);
		}
	});
});
