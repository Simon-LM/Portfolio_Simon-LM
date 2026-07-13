/** @format */

// Tests for the semantic inspector (hc-mécanique chantier, phase 3): the
// name-matching mechanics (known pitfalls) + a smoke test on the
// portfolio's calibrated state (0 active warnings — if this test fails
// after adding a token, the inspector is doing its job: check the new
// token's wiring or document a justified waiver).

import {
	segments,
	familyOf,
	pairBase,
	runAudit,
} from "../hc-semantic-audit";

describe("segments / familyOf — whole-segment matching", () => {
	it("splits on - and _", () => {
		expect(segments("--color-header-bg")).toEqual(["color", "header", "bg"]);
		expect(segments("--sticky_footer_text")).toEqual([
			"sticky",
			"footer",
			"text",
		]);
	});

	it("\"context\" does NOT match \"text\" (whole segment)", () => {
		expect(familyOf("--color-context")).toBeNull();
	});

	it("the LAST recognized segment wins (suffixed convention)", () => {
		// Both "link" AND "bg" present: it's a background
		expect(familyOf("--color-header-blog-link-bg")).toBe("background");
		expect(familyOf("--color-main-text")).toBe("text");
		expect(familyOf("--fg-on-emphasis")).toBe("text");
	});

	it("recognizes synonyms (fg, surface, anchor, ring…)", () => {
		expect(familyOf("--card-surface")).toBe("background");
		expect(familyOf("--fg-muted")).toBe("text");
		expect(familyOf("--nav-anchor")).toBe("link");
		expect(familyOf("--button-ring")).toBe("focus");
	});
});

describe("pairBase — bg/text pairing of the same component", () => {
	it("pairs simple suffixes", () => {
		expect(pairBase("--color-footer-bg")).toBe("color-footer");
		expect(pairBase("--color-footer-text")).toBe("color-footer");
	});

	it("pairs when the family isn't in the final position", () => {
		expect(pairBase("--color-lang-toggle-bg-activated")).toBe(
			"color-lang-toggle-activated",
		);
		expect(pairBase("--color-lang-toggle-text-activated")).toBe(
			"color-lang-toggle-activated",
		);
	});

	it("pairs --fg-on-X with --bg-X (text sitting on that block)", () => {
		expect(pairBase("--fg-on-emphasis")).toBe("emphasis");
		expect(pairBase("--bg-emphasis")).toBe("emphasis");
	});

	it("null when no family segment is found", () => {
		expect(pairBase("--shadow-strength")).toBeNull();
	});
});

describe("smoke — portfolio's calibrated state", () => {
	it("0 active warnings (everything is wired or waived with a reason)", () => {
		const active = runAudit().filter((f) => !f.waived);
		expect(active).toEqual([]);
	});
});
