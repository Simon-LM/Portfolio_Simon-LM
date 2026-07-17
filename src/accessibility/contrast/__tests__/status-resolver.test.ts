/** @jest-environment node */
/** @format */

import { compileString } from "sass";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The status resolver lives in Sass (_theme-utils.scss). These tests compile
// small probes that call resolve-anchor-weight directly, to cover the
// graceful-degradation paths (PLAN-colorblind-redesign.md part 3 phase 2)
// that never fire in the portfolio's own themes (light bg → weight 950 always
// meets 4.5:1, so best-effort is latent).

const projectRoot = path.resolve(__dirname, "../../../..");

function compileProbe(body: string): { css: string; warnings: string[] } {
	const warnings: string[] = [];
	const src =
		`@use "darkmode-plus-a11y/scss/base-palette" as *;\n` +
		`@use "darkmode-plus-a11y/scss/theme-utils" as tu;\n` +
		`a { ${body} }`;
	const result = compileString(src, {
		// node_modules resolves the workspace package (E3); projectRoot is
		// still needed for the probe's temporary path back to portfolio state.
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		url: pathToFileURL(path.join(projectRoot, "__status_resolver_probe__.scss")),
		logger: {
			warn(message) {
				warnings.push(message);
			},
			debug() {},
		},
	});
	return { css: result.css, warnings };
}

function resolvedColor(css: string): string {
	const match = /x:\s*([^;]+);/i.exec(css);
	if (!match) throw new Error(`no resolved value in probe output: ${css}`);
	return match[1].trim();
}

describe("resolve-anchor-weight graceful degradation", () => {
	it("returns the first in-palette weight meeting the target (nominal)", () => {
		const { css, warnings } = compileProbe(
			`x: tu.resolve-anchor-weight("violet", get-color("stone", 50));`,
		);
		expect(resolvedColor(css)).toBe("oklch(54.1% 0.281 293.009deg)"); // violet-600, 5.46:1 on #fafaf9
		expect(warnings).toHaveLength(0);
	});

	it("never hard-fails when the target is unreachable — best effort + warning", () => {
		// Target 21:1 is unreachable for any violet weight on a light bg.
		const { css, warnings } = compileProbe(
			`x: tu.resolve-anchor-weight("violet", get-color("stone", 50), 21);`,
		);
		// Falls back to the highest-contrast weight instead of @error-ing.
		expect(resolvedColor(css)).toBe("oklch(28.3% 0.141 291.089deg)"); // violet-950
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toMatch(/target 21:1 not reached/);
	});

	// The legibility-floor branch (best ratio < 3:1) is defensive only: every
	// Tailwind family spans the full lightness range (50→950), so its extreme
	// weights always clear 3:1 against any background — which is exactly why a
	// hard contrast failure is near-impossible in practice, and why no
	// off-palette computed fallback is built (see resolve-anchor-weight's
	// comment). It therefore has no constructible test with real families.
});
