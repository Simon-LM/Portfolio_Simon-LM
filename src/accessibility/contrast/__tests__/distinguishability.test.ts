/** @jest-environment node */
/** @format */

import { getVar } from "a11y-prefs/testing/extract-themes";
import { distinguishabilityPairs } from "../contrast-pairs";
import { measureDeltaE } from "a11y-prefs/testing/measure";

describe("distinguishability-pairs registry integrity", () => {
	it("has no duplicate pair ids", () => {
		const ids = distinguishabilityPairs.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("references only custom properties that actually exist in the compiled CSS", () => {
		for (const pair of distinguishabilityPairs) {
			for (const theme of pair.themes) {
				expect(() => getVar(theme, pair.colorA)).not.toThrow();
				expect(() => getVar(theme, pair.colorB)).not.toThrow();
				if (pair.composeOverA) {
					expect(() => getVar(theme, pair.composeOverA!)).not.toThrow();
				}
				if (pair.composeOverB) {
					expect(() => getVar(theme, pair.composeOverB!)).not.toThrow();
				}
			}
		}
	});
});

describe("CVD distinguishability — pair × theme matrix", () => {
	for (const pair of distinguishabilityPairs) {
		describe(pair.id, () => {
			for (const theme of pair.themes) {
				it(`stays distinguishable (ΔE ≥ ${pair.minDeltaE}) under "${theme}" simulation`, () => {
					const value = measureDeltaE(pair, theme);
					const waivedValue = pair.waiver?.measured?.[theme];

					if (waivedValue !== undefined) {
						if (value >= pair.minDeltaE) {
							throw new Error(
								`Waiver for "${pair.id}" in theme "${theme}" is obsolete: ` +
									`measured ΔE ${value.toFixed(2)} now meets the ` +
									`${pair.minDeltaE} threshold. Remove it from contrast-pairs.ts.`,
							);
						}
						return;
					}

					expect(value).toBeGreaterThanOrEqual(pair.minDeltaE);
				});
			}
		});
	}
});
