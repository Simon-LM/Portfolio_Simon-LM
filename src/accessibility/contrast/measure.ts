/** @format */

import { getVar } from "./extract-themes";
import { toRgb, compositeOver, contrastRatio, type RgbColor } from "./wcag";
import type { ContrastPair } from "./contrast-pairs";
import type { ThemeOption } from "../../config/themes";

// Resolves a custom property to an opaque color for a given theme,
// compositing over `composeOverVar` first if it carries an alpha channel.
function resolveColor(
	theme: ThemeOption,
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

export function measureRatio(pair: ContrastPair, theme: ThemeOption): number {
	const fg = resolveColor(theme, pair.fg, pair.composeOver);
	const bg = resolveColor(theme, pair.bg, pair.composeOver);
	return contrastRatio(fg, bg);
}
