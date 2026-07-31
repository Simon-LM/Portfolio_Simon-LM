/** @jest-environment node */
/** @format */

import { themeInitScript } from "darkmode-plus-a11y/react/themeInitScript";

// The anti-FOUC script is a string that runs before React exists, so it
// cannot be covered by rendering anything. These tests read the string
// itself: they pin what it restores, and that adding the typography
// options never touches the theme path that every existing caller relies
// on.

const THEMES = ["light", "dark"] as const;

const OPTIONS = {
	dyslexia: { key: "a11y-dyslexia", className: "dyslexia-optimized" },
	fontSizeKey: "a11y-font-size",
	font: { key: "a11y-font", classes: { opendyslexic: "dyslexic-font" } },
};

describe("themeInitScript", () => {
	it("emits the theme branch and nothing else without options", () => {
		const script = themeInitScript(THEMES);

		expect(script).toContain("localStorage.getItem('theme')");
		expect(script).toContain("prefers-color-scheme: dark");
		// No typography statement leaks in: existing callers pass one
		// argument, and their output must not change.
		expect(script).not.toContain("dyslexia");
		expect(script).not.toContain("--font-size-factor");
		expect(script).not.toContain("fontClasses");
	});

	it("leaves the one-argument output untouched when options are empty", () => {
		expect(themeInitScript(THEMES, {})).toBe(themeInitScript(THEMES));
	});

	it("restores each typography preference when asked", () => {
		const script = themeInitScript(THEMES, OPTIONS);

		expect(script).toContain('localStorage.getItem("a11y-dyslexia")');
		expect(script).toContain('classList.add("dyslexia-optimized")');
		expect(script).toContain('localStorage.getItem("a11y-font-size")');
		expect(script).toContain("'--font-size-factor'");
		expect(script).toContain('{"opendyslexic":"dyslexic-font"}');
	});

	it("adds only what is asked for", () => {
		const script = themeInitScript(THEMES, { fontSizeKey: "a11y-font-size" });

		expect(script).toContain("--font-size-factor");
		expect(script).not.toContain("dyslexia");
		expect(script).not.toContain("fontClasses");
	});

	it("keeps everything inside the existing try/catch", () => {
		// A throw here would run before React and take the page down, so a
		// storage access blocked by privacy settings must stay swallowed.
		const script = themeInitScript(THEMES, OPTIONS);
		const body = script.slice(
			script.indexOf("try {"),
			script.indexOf("} catch (e) {}"),
		);

		expect(body).toContain("a11y-dyslexia");
		expect(body).toContain("a11y-font-size");
		expect(body).toContain("a11y-font");
	});

	it("produces a script that actually applies the stored values", () => {
		// Executing the generated string is the only way to know it parses
		// and does what it says.
		const added: string[] = [];
		const props: Record<string, string> = {};
		const store: Record<string, string> = {
			theme: "dark",
			"a11y-dyslexia": "true",
			"a11y-font-size": "150",
			"a11y-font": "opendyslexic",
		};
		const attrs: Record<string, string> = {};

		const context = {
			localStorage: { getItem: (k: string) => store[k] ?? null },
			matchMedia: () => ({ matches: false }),
			document: {
				documentElement: {
					setAttribute: (k: string, v: string) => {
						attrs[k] = v;
					},
					classList: { add: (c: string) => added.push(c) },
					style: {
						setProperty: (k: string, v: string) => {
							props[k] = v;
						},
					},
				},
			},
		};

		new Function(
			"localStorage",
			"window",
			"document",
			themeInitScript(THEMES, OPTIONS),
		)(context.localStorage, context, context.document);

		expect(attrs["data-theme"]).toBe("dark");
		expect(added).toEqual(["dyslexia-optimized", "dyslexic-font"]);
		expect(props["--font-size-factor"]).toBe("1.5");
	});
});
