/** @jest-environment jsdom */
/** @format */

import {
	detectAvailableThemes,
	resolveColorVisionModes,
	COLOR_VISION_TYPES,
} from "darkmode-plus-a11y/react/detectThemes";

// The menu derives its colour-vision buttons from the stylesheet, so a
// mistake here either invents a button for a theme that does not exist,
// or hides one that does. Both failures are silent in the browser.

type FakeRule = { selectorText?: string; cssRules?: FakeRule[] };

function withStyleSheets(sheets: Array<FakeRule[] | "cross-origin">) {
	Object.defineProperty(document, "styleSheets", {
		configurable: true,
		value: sheets.map((rules) =>
			rules === "cross-origin"
				? {
						get cssRules(): never {
							throw new DOMException("SecurityError");
						},
					}
				: { cssRules: rules },
		),
	});
}

describe("detectAvailableThemes", () => {
	it("reads quoted and unquoted selectors", () => {
		// Development emits [data-theme="dark"], minified CSS emits
		// [data-theme=dark]. Both are the same theme.
		withStyleSheets([
			[{ selectorText: '[data-theme="dark"]' }, { selectorText: "[data-theme=protanopia]" }],
		]);

		expect(detectAvailableThemes()).toEqual(new Set(["dark", "protanopia"]));
	});

	it("does not mistake a prefix match for a theme", () => {
		// Real stylesheets group rules with [data-theme^="high-contrast"].
		// Reading that as a theme name would invent a button.
		withStyleSheets([
			[
				{ selectorText: '[data-theme^="high-contrast"] .panel' },
				{ selectorText: '[data-theme="high-contrast-green"]' },
			],
		]);

		expect(detectAvailableThemes()).toEqual(new Set(["high-contrast-green"]));
	});

	it("descends into @media and @layer blocks", () => {
		withStyleSheets([
			[{ cssRules: [{ selectorText: '[data-theme="tritanopia"]' }] }],
		]);

		expect(detectAvailableThemes()).toEqual(new Set(["tritanopia"]));
	});

	it("skips an unreadable sheet without losing the readable ones", () => {
		withStyleSheets([
			"cross-origin",
			[{ selectorText: '[data-theme="deuteranopia"]' }],
		]);

		expect(detectAvailableThemes()).toEqual(new Set(["deuteranopia"]));
	});
});

describe("resolveColorVisionModes", () => {
	it("returns the canonical list for 'all', whatever the CSS says", () => {
		withStyleSheets([[{ selectorText: '[data-theme="light"]' }]]);

		expect(resolveColorVisionModes("all")).toEqual(COLOR_VISION_TYPES);
	});

	it("passes an explicit list through untouched", () => {
		withStyleSheets([[]]);

		expect(resolveColorVisionModes(["protanopia"])).toEqual(["protanopia"]);
	});

	it("keeps only the modes the CSS declares, in canonical order", () => {
		withStyleSheets([
			[
				{ selectorText: '[data-theme="tritanopia"]' },
				{ selectorText: '[data-theme="protanopia"]' },
				{ selectorText: '[data-theme="dark"]' },
			],
		]);

		expect(resolveColorVisionModes("auto")).toEqual([
			"protanopia",
			"tritanopia",
		]);
	});

	it("returns nothing when the site declares themes but no colour-vision one", () => {
		// Meaningful emptiness: the section has nothing to show.
		withStyleSheets([[{ selectorText: '[data-theme="dark"]' }]]);

		expect(resolveColorVisionModes("auto")).toEqual([]);
	});

	it("falls back to everything when detection finds nothing at all", () => {
		// No site has zero themes, so this is a failed read, not a site
		// without themes. Hiding a mode someone needs is the worse error.
		withStyleSheets(["cross-origin"]);

		expect(resolveColorVisionModes("auto")).toEqual(COLOR_VISION_TYPES);
	});
});
