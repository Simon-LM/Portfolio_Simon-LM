/** @format */

import { differenceCiede2000 } from "culori";
import { simulateCvd, simulateForCvdTheme } from "darkmode-plus-a11y/testing/cvd-simulation";
import { toRgb } from "darkmode-plus-a11y/testing/wcag";

const deltaE = differenceCiede2000();

function expectSameColor(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
	expect(a.r).toBeCloseTo(b.r, 5);
	expect(a.g).toBeCloseTo(b.g, 5);
	expect(a.b).toBeCloseTo(b.b, 5);
}

describe("simulateCvd", () => {
	it("leaves neutral grays unchanged at full severity (matrix rows sum to 1)", () => {
		const gray = toRgb("#808080");
		for (const type of ["protan", "deutan", "tritan"] as const) {
			const simulated = simulateCvd(gray, type, 1.0);
			expectSameColor(simulated, gray);
		}
	});

	it("is a no-op at severity 0", () => {
		const color = toRgb("#fcd34d");
		for (const type of ["protan", "deutan", "tritan"] as const) {
			expectSameColor(simulateCvd(color, type, 0), color);
		}
	});

	it("blends linearly between severity 0 and 1", () => {
		const color = toRgb("#dc2626");
		const half = simulateCvd(color, "deutan", 0.5);
		const full = simulateCvd(color, "deutan", 1.0);
		// The 0.5-severity result should sit strictly between the original
		// and the fully-simulated color on every channel (monotonic blend).
		for (const ch of ["r", "g", "b"] as const) {
			const lo = Math.min(color[ch], full[ch]);
			const hi = Math.max(color[ch], full[ch]);
			expect(half[ch]).toBeGreaterThanOrEqual(lo - 1e-9);
			expect(half[ch]).toBeLessThanOrEqual(hi + 1e-9);
		}
	});

	it("collapses red/green confusion under full-severity protanopia and deuteranopia (the textbook property of red-green CVD)", () => {
		const red = toRgb("#ff0000");
		const green = toRgb("#00ff00");
		const originalDeltaE = deltaE(red, green);
		expect(originalDeltaE).toBeGreaterThan(50); // very distinct originally

		for (const type of ["protan", "deutan"] as const) {
			const simulatedRed = simulateCvd(red, type, 1.0);
			const simulatedGreen = simulateCvd(green, type, 1.0);
			const simulatedDeltaE = deltaE(simulatedRed, simulatedGreen);
			// Not necessarily near-zero (these are saturated primaries, not a
			// carefully chosen confusion pair), but the textbook expectation
			// is a drastic collapse relative to the original distinction.
			expect(simulatedDeltaE).toBeLessThan(originalDeltaE * 0.5);
		}
	});
});

describe("simulateForCvdTheme", () => {
	it("matches simulateCvd with the theme's documented type/severity", () => {
		const color = toRgb("#0c4a6e");
		expectSameColor(simulateForCvdTheme(color, "protanopia"), simulateCvd(color, "protan", 1.0));
		expectSameColor(simulateForCvdTheme(color, "protanomaly"), simulateCvd(color, "protan", 0.5));
		expectSameColor(simulateForCvdTheme(color, "deuteranopia"), simulateCvd(color, "deutan", 1.0));
		expectSameColor(simulateForCvdTheme(color, "deuteranomaly"), simulateCvd(color, "deutan", 0.5));
		expectSameColor(simulateForCvdTheme(color, "tritanopia"), simulateCvd(color, "tritan", 1.0));
		expectSameColor(simulateForCvdTheme(color, "tritanomaly"), simulateCvd(color, "tritan", 0.5));
	});

	it("achromatopsia collapses to the BT.601 luma the site's own engine uses (gray, R=G=B)", () => {
		const color = toRgb("#dc2626"); // red-600
		const simulated = simulateForCvdTheme(color, "achromatopsia");
		expect(simulated.r).toBeCloseTo(simulated.g, 5);
		expect(simulated.g).toBeCloseTo(simulated.b, 5);
		const expectedLuma = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
		expect(simulated.r).toBeCloseTo(expectedLuma, 5);
	});
});
