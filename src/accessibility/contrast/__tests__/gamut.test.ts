/** @jest-environment node */
/** @format */

import { getThemeVars, getRootVars } from "darkmode-plus-a11y/testing/extract-themes";
import { outOfGamutReason, gamutWaivers } from "darkmode-plus-a11y/testing/gamut";

type Finding = { theme: string; prop: string; reason: string };

// Scan every color custom property of every theme (plus :root) in the
// compiled CSS for an out-of-gamut serialization.
function collectFindings(): Finding[] {
	const blocks: [string, Map<string, string>][] = [
		[":root", getRootVars()],
		...[...getThemeVars()].map(
			([theme, vars]) => [theme, vars] as [string, Map<string, string>],
		),
	];

	const findings: Finding[] = [];
	for (const [theme, vars] of blocks) {
		for (const [prop, value] of vars) {
			const reason = outOfGamutReason(value);
			if (reason) findings.push({ theme, prop, reason });
		}
	}
	return findings;
}

describe("sRGB gamut guard", () => {
	const findings = collectFindings();

	const isWaived = (theme: string, prop: string) =>
		gamutWaivers.some((w) => w.theme === theme && w.prop === prop);

	it("emits no out-of-gamut color outside the documented waivers", () => {
		const unwaived = findings
			.filter((f) => !isWaived(f.theme, f.prop))
			.map((f) => `${f.theme} ${f.prop} — ${f.reason}`);
		expect(unwaived).toEqual([]);
	});

	it("has no obsolete gamut waiver (anti-zombie)", () => {
		const obsolete = gamutWaivers
			.filter(
				(w) => !findings.some((f) => f.theme === w.theme && f.prop === w.prop),
			)
			.map(
				(w) =>
					`${w.theme} ${w.prop} is now in-gamut; remove its waiver from gamut.ts`,
			);
		expect(obsolete).toEqual([]);
	});
});
