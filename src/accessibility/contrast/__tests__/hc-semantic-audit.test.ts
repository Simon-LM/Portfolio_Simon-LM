/** @format */

// Tests de l'inspecteur sémantique (chantier hc-mécanique phase 3) : la
// mécanique de matching des noms (pièges connus) + un smoke sur l'état
// calibré du portfolio (0 avertissement actif — si ce test échoue après
// un ajout de token, c'est l'inspecteur qui fait son travail : vérifier
// le branchement du nouveau token ou documenter un waiver argumenté).

import {
	segments,
	familyOf,
	pairBase,
	runAudit,
} from "../hc-semantic-audit";

describe("segments / familyOf — matching par segment entier", () => {
	it("découpe sur - et _", () => {
		expect(segments("--color-header-bg")).toEqual(["color", "header", "bg"]);
		expect(segments("--sticky_footer_text")).toEqual([
			"sticky",
			"footer",
			"text",
		]);
	});

	it("« context » ne matche PAS « text » (segment entier)", () => {
		expect(familyOf("--color-context")).toBeNull();
	});

	it("le DERNIER segment reconnu gagne (convention suffixée)", () => {
		// « link » ET « bg » présents : c'est un fond
		expect(familyOf("--color-header-blog-link-bg")).toBe("background");
		expect(familyOf("--color-main-text")).toBe("text");
		expect(familyOf("--fg-on-emphasis")).toBe("text");
	});

	it("reconnaît les synonymes (fg, surface, anchor, ring…)", () => {
		expect(familyOf("--card-surface")).toBe("background");
		expect(familyOf("--fg-muted")).toBe("text");
		expect(familyOf("--nav-anchor")).toBe("link");
		expect(familyOf("--button-ring")).toBe("focus");
	});
});

describe("pairBase — appariement bg/texte d'un même composant", () => {
	it("apparie les suffixes simples", () => {
		expect(pairBase("--color-footer-bg")).toBe("color-footer");
		expect(pairBase("--color-footer-text")).toBe("color-footer");
	});

	it("apparie quand la famille n'est pas en position finale", () => {
		expect(pairBase("--color-lang-toggle-bg-activated")).toBe(
			"color-lang-toggle-activated",
		);
		expect(pairBase("--color-lang-toggle-text-activated")).toBe(
			"color-lang-toggle-activated",
		);
	});

	it("apparie --fg-on-X avec --bg-X (texte posé sur ce bloc)", () => {
		expect(pairBase("--fg-on-emphasis")).toBe("emphasis");
		expect(pairBase("--bg-emphasis")).toBe("emphasis");
	});

	it("null si aucun segment de famille", () => {
		expect(pairBase("--shadow-strength")).toBeNull();
	});
});

describe("smoke — état calibré du portfolio", () => {
	it("0 avertissement actif (tout est branché ou waivé avec raison)", () => {
		const active = runAudit().filter((f) => !f.waived);
		expect(active).toEqual([]);
	});
});
