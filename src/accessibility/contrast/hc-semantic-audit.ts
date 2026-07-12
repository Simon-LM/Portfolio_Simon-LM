/** @format */

import "./setup";

// Inspecteur SÉMANTIQUE du fort contraste (chantier hc-mécanique, phase 3
// — décision Simon 2026-07-11). C'est le design d'origine de Simon
// (capture par les mots des noms de variables, élargie aux synonymes)
// recyclé en CONTRÔLE : les noms ne décident plus des couleurs (c'est le
// branchement couche 2 qui décide), ils surveillent. Si le nom d'un token
// suggère une famille (texte, fond, lien, focus) et que la valeur émise la
// contredit, on émet un avertissement. Jamais bloquant, jamais de
// modification — attrape les branchements DE TRAVERS qui tombent dans la
// palette (l'angle mort du contrôle par valeur).
//
// Usage : pnpm hc:audit  → console + docs/theme-system/HC-SEMANTIC-AUDIT.md

import * as fs from "node:fs";
import * as path from "node:path";
import { THEMES } from "../../config/themes";
import { getThemeVars } from "a11y-prefs/testing/extract-themes";

// Familles sémantiques — synonymes qu'un dev (ou une IA) est susceptible
// d'utiliser dans ses noms de variables de couche 3. Le matching se fait
// par SEGMENT entier (découpe sur - et _) : « context » ne matche pas
// « text ».
const FAMILIES: Record<string, readonly string[]> = {
	text: ["text", "txt", "fg", "foreground", "ink", "label", "copy"],
	background: ["bg", "background", "backdrop", "surface", "fill"],
	link: ["link", "anchor"],
	focus: ["focus", "ring"],
};

// Slot de palette attendu par famille (clés des cartes de thème).
const EXPECTED_SLOT: Record<string, string> = {
	text: "text",
	background: "background",
	link: "link",
	focus: "focus",
};

// Contradictions surveillées : famille du nom → slots dont la valeur émise
// déclenche un avertissement. Volontairement conservateur (un texte qui
// vaut la couleur de FOND est suspect ; un texte qui vaut la couleur de
// lien ne l'est pas forcément).
const CONTRADICTIONS: Record<string, readonly string[]> = {
	text: ["background"],
	background: ["text"],
	link: ["background"],
	focus: ["background"],
};

// Slots par thème — MIROIR de src/styles/themes/_high-contrast*.scss.
const HC_SLOTS: Record<string, Record<string, string>> = {
	"high-contrast": {
		background: "#000000",
		text: "#ffff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-green": {
		background: "#000000",
		text: "#00ff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-white": {
		background: "#000000",
		text: "#ffffff",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-paper": {
		background: "#ffffff",
		text: "#000000",
		link: "#000099",
		focus: "#000000",
	},
};

// Tokens légitimement « contradictoires », avec leur raison — typiquement
// du texte posé SUR un bloc coloré (il prend logiquement une couleur
// d'encre = celle du fond de page). Toute nouvelle entrée doit être
// argumentée.
const WAIVERS: readonly { pattern: RegExp; reason: string }[] = [
	{
		pattern: /^--fg-on-/,
		reason:
			"texte posé SUR un bloc coloré (accent/emphasis) : l'encre vaut légitimement la couleur de fond de page",
	},
	{
		pattern: /^--color-header-text/,
		reason:
			"texte du header, posé sur la bande colorée (highlight) : encre sombre légitime",
	},
	{
		pattern: /^--color-lang-toggle-text-activated$/,
		reason: "texte du bouton de langue actif, posé sur bg-emphasis (bloc coloré)",
	},
	{
		pattern: /-inverse(-|$)/,
		reason:
			"bloc volontairement INVERSÉ — l'inversion est déclarée dans le nom",
	},
	{
		pattern: /^--bg-emphasis-strong$/,
		reason:
			"surface d'emphase forte = bloc inversé par conception (texte posé dessus : --fg-on-emphasis)",
	},
	{
		pattern: /^--color-collapse-bg-title$/,
		reason:
			"barre de titre des collapses = bloc d'emphase inversé (texte posé dessus en encre sombre)",
	},
];

/** Découpe un nom de custom property en segments : --color-header-bg →
 *  ["color", "header", "bg"] */
export function segments(name: string): string[] {
	return name.replace(/^--/, "").split(/[-_]/).filter(Boolean);
}

/** Famille sémantique d'un nom — le DERNIER segment reconnu gagne (dans la
 *  convention suffixée, le dernier mot dit le rôle : header-blog-link-bg
 *  est un fond, pas un lien). Renvoie null si aucun segment reconnu. */
export function familyOf(name: string): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const [family, words] of Object.entries(FAMILIES)) {
			if (words.includes(segs[i])) return family;
		}
	}
	return null;
}

export type Finding = {
	theme: string;
	name: string;
	value: string;
	family: string;
	conflictingSlot: string;
	waived: string | null;
};

/** Base d'appariement : le nom privé de son segment de famille, où qu'il
 *  soit (--color-footer-bg → « color-footer » ; --color-lang-toggle-bg-
 *  activated → « color-lang-toggle-activated »). Le préfixe « on- » est
 *  aussi retiré : --fg-on-emphasis s'apparie avec --bg-emphasis (texte
 *  posé sur ce bloc). */
export function pairBase(name: string): string | null {
	const segs = segments(name);
	for (let i = segs.length - 1; i >= 0; i--) {
		for (const words of Object.values(FAMILIES)) {
			if (words.includes(segs[i])) {
				const rest = [...segs.slice(0, i), ...segs.slice(i + 1)];
				// --fg-ON-emphasis : le « on » dit « posé sur » → même base
				// que le bloc correspondant
				if (rest[i] === "on") rest.splice(i, 1);
				return rest.join("-");
			}
		}
	}
	return null;
}

export function runAudit(): Finding[] {
	const findings: Finding[] = [];
	const hcThemes = THEMES.filter((t) => t.startsWith("high-contrast"));

	for (const theme of hcThemes) {
		const vars = getThemeVars().get(theme);
		const slots = HC_SLOTS[theme];
		if (!vars || !slots) continue;

		// 1. Recenser les PAIRES composant (même base, familles text + bg).
		// Un bloc peut être légitimement inversé (footer noir sur page
		// blanche) : la vérité d'une paire est dans la paire, pas dans les
		// slots globaux du thème.
		const pairs = new Map<string, { text?: [string, string]; background?: [string, string] }>();
		for (const [name, value] of vars) {
			const family = familyOf(name);
			if (family !== "text" && family !== "background") continue;
			const base = pairBase(name);
			if (base === null) continue;
			const entry = pairs.get(base) ?? {};
			entry[family] = [name, value.trim().toLowerCase()];
			pairs.set(base, entry);
		}

		const paired = new Set<string>();
		for (const entry of pairs.values()) {
			if (entry.text && entry.background) {
				paired.add(entry.text[0]);
				paired.add(entry.background[0]);
				// Contrôle de paire : texte == fond → texte invisible.
				if (entry.text[1] === entry.background[1]) {
					const waiver = WAIVERS.find((w) => w.pattern.test(entry.text![0]));
					findings.push({
						theme,
						name: `${entry.text[0]} + ${entry.background[0]}`,
						value: entry.text[1],
						family: "paire",
						conflictingSlot: "texte identique au fond (invisible)",
						waived: waiver ? waiver.reason : null,
					});
				}
			}
		}

		// 2. Règle globale nom↔slot — UNIQUEMENT pour les tokens orphelins
		// (sans moitié de paire) : là, pas de contexte local, les slots du
		// thème sont la seule référence.
		for (const [name, value] of vars) {
			if (paired.has(name)) continue;
			const family = familyOf(name);
			if (!family) continue;
			const norm = value.trim().toLowerCase();

			for (const slot of CONTRADICTIONS[family] ?? []) {
				if (norm === slots[slot] && norm !== slots[EXPECTED_SLOT[family]]) {
					const waiver = WAIVERS.find((w) => w.pattern.test(name));
					findings.push({
						theme,
						name,
						value: norm,
						family,
						conflictingSlot: slot,
						waived: waiver ? waiver.reason : null,
					});
				}
			}
		}
	}
	return findings;
}

function formatReport(findings: Finding[]): string {
	const active = findings.filter((f) => !f.waived);
	const waived = findings.filter((f) => f.waived);
	const lines: string[] = [
		"<!-- @format -->",
		"",
		"# Audit sémantique du fort contraste",
		"",
		"Artefact généré par `pnpm hc:audit` — ne pas éditer à la main.",
		"Contrôle en LECTURE SEULE : les noms de variables ne décident d'aucune",
		"couleur (le branchement couche 2 décide) ; ils servent d'inspecteurs.",
		"Un avertissement = « le nom suggère une famille, la valeur émise la",
		"contredit » — à vérifier, jamais bloquant.",
		"",
		`## Avertissements actifs : ${active.length}`,
		"",
	];
	if (active.length === 0) {
		lines.push("Aucun. Tous les noms sémantiques sont cohérents avec les",
			"valeurs émises (ou couverts par un waiver argumenté).", "");
	} else {
		for (const f of active) {
			lines.push(
				`- ⚠️ \`${f.name}\` (${f.theme}) : nommé « ${f.family} » mais émet` +
				` \`${f.value}\` (= slot ${f.conflictingSlot}) — vérifier le branchement`,
			);
		}
		lines.push("");
	}
	lines.push(`## Waivers (contradictions légitimes) : ${waived.length}`, "");
	const seen = new Set<string>();
	for (const f of waived) {
		const key = `${f.name}|${f.waived}`;
		if (seen.has(key)) continue;
		seen.add(key);
		lines.push(`- \`${f.name}\` — ${f.waived}`);
	}
	lines.push("");
	return lines.join("\n");
}

// Exécution directe (tsx)
if (require.main === module) {
	const findings = runAudit();
	const active = findings.filter((f) => !f.waived);
	const report = formatReport(findings);
	const out = path.resolve(
		__dirname,
		"../../../docs/theme-system/HC-SEMANTIC-AUDIT.md",
	);
	fs.writeFileSync(out, report);
	for (const f of active) {
		console.warn(
			`⚠️  [hc-audit] ${f.theme} ${f.name}: nommé « ${f.family} » mais émet ${f.value} (slot ${f.conflictingSlot})`,
		);
	}
	console.log(
		`hc-audit : ${active.length} avertissement(s) actif(s), ${
			findings.length - active.length
		} waivé(s) — rapport : ${out}`,
	);
}
