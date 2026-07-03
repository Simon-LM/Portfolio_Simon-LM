/** @jest-environment node */
/** @format */

import { getVar } from "../extract-themes";
import {
	toRgb,
	compositeOver,
	contrastRatio,
	thresholdFor,
	type RgbColor,
} from "../wcag";
import { contrastPairs, type ContrastPair } from "../contrast-pairs";
import { THEMES, type ThemeOption } from "../../../config/themes";

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

function measureRatio(pair: ContrastPair, theme: ThemeOption): number {
	const fg = resolveColor(theme, pair.fg, pair.composeOver);
	const bg = resolveColor(theme, pair.bg, pair.composeOver);
	return contrastRatio(fg, bg);
}

describe("contrast-pairs registry integrity", () => {
	it("has no duplicate pair ids", () => {
		const ids = contrastPairs.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("references only custom properties that actually exist in the compiled CSS", () => {
		for (const pair of contrastPairs) {
			for (const theme of pair.themes ?? THEMES) {
				expect(() => getVar(theme, pair.fg)).not.toThrow();
				expect(() => getVar(theme, pair.bg)).not.toThrow();
				if (pair.composeOver) {
					expect(() => getVar(theme, pair.composeOver!)).not.toThrow();
				}
			}
		}
	});
});

describe("WCAG contrast — pair × theme matrix", () => {
	for (const pair of contrastPairs) {
		const themes = pair.themes ?? THEMES;
		describe(pair.id, () => {
			for (const theme of themes) {
				it(`meets its ${pair.level} threshold in "${theme}"`, () => {
					const ratio = measureRatio(pair, theme);
					const threshold = thresholdFor(pair.level);
					const waivedRatio = pair.waiver?.measured?.[theme];

					if (waivedRatio !== undefined) {
						if (ratio >= threshold) {
							throw new Error(
								`Waiver for "${pair.id}" in theme "${theme}" is obsolete: ` +
									`measured ratio ${ratio.toFixed(2)}:1 now meets the ` +
									`${threshold}:1 threshold. Remove it from contrast-pairs.ts.`,
							);
						}
						// Still non-compliant as recorded: the waiver remains valid.
						return;
					}

					expect(ratio).toBeGreaterThanOrEqual(threshold);
				});
			}
		});
	}
});
