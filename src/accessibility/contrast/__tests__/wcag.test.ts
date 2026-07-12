/** @format */

import { toRgb, compositeOver, contrastRatio, thresholdFor } from "a11y-prefs/testing/wcag";

describe("toRgb", () => {
	it("parses hex colors into normalized 0-1 RGB channels", () => {
		expect(toRgb("#ffffff")).toMatchObject({ r: 1, g: 1, b: 1 });
		expect(toRgb("#000000")).toMatchObject({ r: 0, g: 0, b: 0 });
	});

	it("parses rgba() and keeps the alpha channel", () => {
		const c = toRgb("rgba(0, 0, 0, 0.5)");
		expect(c.alpha).toBeCloseTo(0.5, 5);
	});

	it("parses hsl()", () => {
		const c = toRgb("hsl(210, 100%, 20%)");
		expect(c.r).toBeCloseTo(0, 5);
		expect(c.g).toBeCloseTo(0.2, 5);
		expect(c.b).toBeCloseTo(0.4, 5);
	});

	it("throws instead of silently defaulting on an invalid color", () => {
		expect(() => toRgb("not-a-color")).toThrow(/not a valid CSS color/);
	});
});

describe("contrastRatio", () => {
	it("black on white is 21:1", () => {
		expect(contrastRatio(toRgb("#000000"), toRgb("#ffffff"))).toBeCloseTo(
			21,
			1,
		);
	});

	it("#767676 on white is ~4.54:1 (the classic WCAG borderline example)", () => {
		expect(contrastRatio(toRgb("#767676"), toRgb("#ffffff"))).toBeCloseTo(
			4.54,
			1,
		);
	});

	it("is symmetric-independent of argument order in absolute value sense", () => {
		const a = contrastRatio(toRgb("#000000"), toRgb("#ffffff"));
		const b = contrastRatio(toRgb("#ffffff"), toRgb("#000000"));
		expect(a).toBeCloseTo(b, 5);
	});
});

describe("compositeOver", () => {
	it("composes rgba(0,0,0,0.5) over white to ~#808080 (within 1/255 per channel)", () => {
		const result = compositeOver(toRgb("rgba(0, 0, 0, 0.5)"), toRgb("#ffffff"));
		expect(Math.abs(result.r * 255 - 128)).toBeLessThanOrEqual(1);
		expect(Math.abs(result.g * 255 - 128)).toBeLessThanOrEqual(1);
		expect(Math.abs(result.b * 255 - 128)).toBeLessThanOrEqual(1);
		expect(result.alpha).toBeUndefined();
	});

	it("returns the foreground unchanged when it's fully opaque", () => {
		const fg = toRgb("#123456");
		const result = compositeOver(fg, toRgb("#ffffff"));
		expect(result.r).toBeCloseTo(fg.r, 10);
		expect(result.g).toBeCloseTo(fg.g, 10);
		expect(result.b).toBeCloseTo(fg.b, 10);
	});
});

describe("thresholdFor", () => {
	it("returns the WCAG 2.2 thresholds for each level", () => {
		expect(thresholdFor("text")).toBe(4.5);
		expect(thresholdFor("large-text")).toBe(3.0);
		expect(thresholdFor("non-text")).toBe(3.0);
	});
});
