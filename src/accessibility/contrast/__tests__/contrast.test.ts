/** @jest-environment node */
/** @format */

import { getVar } from "a11y-prefs/testing/extract-themes";
import { thresholdFor } from "a11y-prefs/testing/wcag";
import { contrastPairs } from "../contrast-pairs";
import { THEMES } from "../../../config/themes";
import { measureRatio } from "a11y-prefs/testing/measure";

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
