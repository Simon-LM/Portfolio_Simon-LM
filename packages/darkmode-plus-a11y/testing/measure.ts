/** @format */

import { differenceCiede2000 } from "culori";
import { getVar } from "./extract-themes";
import { toRgb, compositeOver, contrastRatio, type RgbColor } from "./wcag";
import { simulateForCvdTheme, type CvdTheme } from "./cvd-simulation";
import type { ContrastPair, DistinguishabilityPair } from "./pairs";

const deltaE = differenceCiede2000();

// Resolves a custom property to an opaque color for a given theme,
// compositing over `composeOverVar` first if it carries an alpha channel.
export function resolveColor(
	theme: string,
	varName: string,
	composeOverVar?: string,
): RgbColor {
	const color = toRgb(getVar(theme, varName));
	if (color.alpha !== undefined && color.alpha < 1) {
		if (!composeOverVar) {
			throw new Error(
				`resolveColor: "${varName}" in theme "${theme}" has alpha ${color.alpha} ` +
					`but the pair declares no composeOver`,
			);
		}
		const backdrop = toRgb(getVar(theme, composeOverVar));
		return compositeOver(color, backdrop);
	}
	return color;
}

export function measureRatio(pair: ContrastPair, theme: string): number {
	const fg = resolveColor(theme, pair.fg, pair.composeOver);
	const bg = resolveColor(theme, pair.bg, pair.composeOver);
	return contrastRatio(fg, bg);
}

// Resolves both colors of a distinguishability pair, simulates the given
// CVD theme's perception of each, and returns the ΔE CIEDE2000 between the
// two simulated colors — the measure of whether they still look different.
export function measureDeltaE(pair: DistinguishabilityPair, theme: CvdTheme): number {
	const a = resolveColor(theme, pair.colorA, pair.composeOverA);
	const b = resolveColor(theme, pair.colorB, pair.composeOverB);
	const simulatedA = simulateForCvdTheme(a, theme);
	const simulatedB = simulateForCvdTheme(b, theme);
	return deltaE(simulatedA, simulatedB);
}
