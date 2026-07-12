/** @format */

import { convertRgbToLrgb, convertLrgbToRgb } from "culori";
import type { RgbColor } from "./wcag";

// Full-severity (1.0) dichromacy simulation matrices, applied in *linear*
// RGB. Source: Machado, Oliveira & Fernandes, "A Physiologically-based
// Model for Simulation of Color Vision Deficiency" (IEEE TVCG 15(6), 2009)
// — these are the paper's own 100%-severity matrices, as commonly
// reproduced (e.g. Chromium's "Emulate vision deficiencies" DevTools
// feature). Each row sums to ≈1 by construction: a neutral gray (R=G=B in
// linear space) is invariant under every matrix, matching the fact that
// none of these deficiencies affect achromatic perception — this is the
// property `cvd-simulation.test.ts` checks directly.
type DichromacyType = "protan" | "deutan" | "tritan";

const MATRICES: Record<DichromacyType, readonly (readonly [number, number, number])[]> = {
	protan: [
		[0.152286, 1.052583, -0.204868],
		[0.114503, 0.786281, 0.099216],
		[-0.003882, -0.048116, 1.051998],
	],
	deutan: [
		[0.367322, 0.860646, -0.227968],
		[0.280085, 0.672501, 0.047413],
		[-0.01182, 0.04294, 0.968881],
	],
	tritan: [
		[1.255528, -0.076749, -0.178779],
		[-0.078411, 0.930809, 0.147602],
		[0.004733, 0.691367, 0.3039],
	],
};

function applyMatrix(
	m: readonly (readonly [number, number, number])[],
	r: number,
	g: number,
	b: number,
): [number, number, number] {
	return [
		m[0][0] * r + m[0][1] * g + m[0][2] * b,
		m[1][0] * r + m[1][1] * g + m[1][2] * b,
		m[2][0] * r + m[2][1] * g + m[2][2] * b,
	];
}

// Simulates how `color` would be perceived under `type` dichromacy at the
// given `severity` (0 = unaffected, 1 = full dichromacy). Anomalous
// trichromacy (deuteranomaly, etc.) is modeled, per Machado et al., as a
// partial shift toward the full-dichromacy percept: linearly interpolating
// the *linear-RGB* result between the original and the fully-simulated
// color is the standard approximation (matches Chromium's implementation)
// and is algebraically equivalent to interpolating the matrix itself
// toward the identity matrix.
export function simulateCvd(
	color: RgbColor,
	type: DichromacyType,
	severity: number,
): RgbColor {
	const linear = convertRgbToLrgb({ r: color.r, g: color.g, b: color.b });
	const [sr, sg, sb] = applyMatrix(MATRICES[type], linear.r, linear.g, linear.b);
	const blended = {
		r: severity * sr + (1 - severity) * linear.r,
		g: severity * sg + (1 - severity) * linear.g,
		b: severity * sb + (1 - severity) * linear.b,
	};
	const back = convertLrgbToRgb(blended);
	return { mode: "rgb", r: back.r, g: back.g, b: back.b, alpha: color.alpha };
}

// Achromatopsia is not a dichromacy and isn't modeled by the Machado
// matrices above; it's full monochromacy. Simulated here with the exact
// luma formula the codebase's own achromatopsia engine already uses
// (`adapt-color-for-achromatopsia` in _theme-utils.scss: BT.601 luma on
// gamma-corrected sRGB channels) so this simulation matches what the site
// actually renders, not a theoretically "purer" CVD model.
function simulateAchromatopsia(color: RgbColor): RgbColor {
	const luma = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
	return { mode: "rgb", r: luma, g: luma, b: luma, alpha: color.alpha };
}

export type CvdTheme =
	| "deuteranomaly"
	| "deuteranopia"
	| "protanomaly"
	| "protanopia"
	| "tritanomaly"
	| "tritanopia"
	| "achromatopsia";

const DICHROMACY_CONFIG: Record<
	Exclude<CvdTheme, "achromatopsia">,
	{ type: DichromacyType; severity: number }
> = {
	protanopia: { type: "protan", severity: 1.0 },
	protanomaly: { type: "protan", severity: 0.5 },
	deuteranopia: { type: "deutan", severity: 1.0 },
	deuteranomaly: { type: "deutan", severity: 0.5 },
	tritanopia: { type: "tritan", severity: 1.0 },
	tritanomaly: { type: "tritan", severity: 0.5 },
};

export function simulateForCvdTheme(color: RgbColor, theme: CvdTheme): RgbColor {
	if (theme === "achromatopsia") {
		return simulateAchromatopsia(color);
	}
	const { type, severity } = DICHROMACY_CONFIG[theme];
	return simulateCvd(color, type, severity);
}
