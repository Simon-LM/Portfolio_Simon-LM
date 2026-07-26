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

// --- Status-vs-link separation warning ---------------------------------
//
// Under red-green deficiency the hue axis collapses, so a status role
// anchored into the blue pole (violet) can land on top of --link, which
// usually lives there too. Sass cannot compute the ΔE that would prove it,
// so the engine reports a suspicion using lightness + hue proximity. These
// tests pin the two properties that make such a heuristic acceptable: it
// stays silent on palettes that are fine, and it never changes a color.

function compileThemeProbe(
	link: string,
	themes = `"protanopia","deuteranopia"`,
): { css: string; warnings: string[] } {
	const warnings: string[] = [];
	const src =
		`@use "darkmode-plus-a11y/scss/state" as st with (\n` +
		`\t$gray-family: "slate",\n` +
		`\t$primitives: (\n` +
		`\t\t"accent": ("amber", 300), "accent-strong": ("amber", 500),\n` +
		`\t\t"accent-ink": ("amber", 950), "accent-soft": ("amber", 100),\n` +
		`\t\t"link": ${link}, "link-hover": ("slate", 800),\n` +
		`\t\t"success": ("emerald", 700), "danger": ("red", 600)\n` +
		`\t)\n` +
		`);\n` +
		`@use "darkmode-plus-a11y/scss/theme-generator" as tg;\n` +
		`@include tg.generate-all-themes((${themes})) using ($name) {\n` +
		`\t@include tg.emit-role-vars();\n` +
		`}`;
	const result = compileString(src, {
		loadPaths: [projectRoot, path.join(projectRoot, "node_modules")],
		url: pathToFileURL(path.join(projectRoot, "__status_link_probe__.scss")),
		logger: {
			warn(message) {
				warnings.push(message);
			},
			debug() {},
		},
	});
	return { css: result.css, warnings };
}

const separationWarnings = (warnings: string[]) =>
	warnings.filter((w) => w.includes("may be indistinguishable"));

function darkVarOf(css: string, theme: string, prop: string): string {
	const block = new RegExp(
		`\\[data-theme="?${theme}"?\\]\\s*\\{([\\s\\S]*?)\\n\\}`,
	).exec(css);
	if (!block) throw new Error(`no ${theme} block`);
	const decl = new RegExp(`${prop}:\\s*([^;]+);`).exec(block[1]);
	if (!decl) throw new Error(`no ${prop} in ${theme}`);
	return decl[1].trim();
}

describe("status vs link separation warning", () => {
	it("reports a mid-weight blue link colliding with the violet anchor", () => {
		// indigo-600 and the violet-600 anchor differ by 1.10:1 and 16° — the
		// simulated ΔE is 0.7, far under the suite's threshold of 12.
		const { warnings } = compileThemeProbe(`("indigo", 600)`);
		const reported = separationWarnings(warnings);
		expect(reported).toHaveLength(2); // one per red-green theme
		expect(reported[0]).toMatch(/success/);
		expect(reported[0]).toMatch(/--link/);
	});

	it("stays silent on the package's own default link", () => {
		// sky-900 sits at 1.61:1, just past the threshold. A package that warns
		// about its own defaults trains people to ignore the warning.
		expect(separationWarnings(compileThemeProbe(`("sky", 900)`).warnings))
			.toHaveLength(0);
	});

	it("stays silent when hue alone still separates the pair", () => {
		// cyan-700 is as close in lightness as the failing cases (1.10:1) but
		// 100° away, and measures ΔE 17.9 — distinguishable. Without the hue
		// condition this would be a false alarm.
		expect(separationWarnings(compileThemeProbe(`("cyan", 700)`).warnings))
			.toHaveLength(0);
	});

	it("does not report the danger anchor, which sits on the opposite pole", () => {
		// The orange anchor is ~121° from a blue link (ΔE 65). It is close in
		// lightness, so a lightness-only test would report it on every palette.
		const reported = separationWarnings(
			compileThemeProbe(`("indigo", 600)`).warnings,
		);
		expect(reported.some((w) => w.startsWith("danger:"))).toBe(false);
	});

	it("never changes the color it warns about", () => {
		// The whole point: it is a prompt to verify, not a correction. A
		// warned palette must emit exactly what an unwarned one would.
		const warned = compileThemeProbe(`("indigo", 600)`);
		const quiet = compileThemeProbe(`("cyan", 700)`);
		expect(separationWarnings(warned.warnings)).toHaveLength(2);
		expect(darkVarOf(warned.css, "protanopia", "--success")).toBe(
			darkVarOf(quiet.css, "protanopia", "--success"),
		);
	});

	it("does not fire on the anomaly themes, where hue is compressed not collapsed", () => {
		// The heuristic assumes hue collapses onto two poles — true of
		// dichromacy, false of anomalous trichromacy. A cyan link against the
		// anomaly themes' emerald anchor is as close in lightness as the
		// failing cases (1.03:1) yet measures ΔE 29: reporting it would be a
		// false alarm. Regression guard for a probe that only generated the
		// -opia themes and therefore missed this entirely.
		expect(
			separationWarnings(
				compileThemeProbe(`("cyan", 700)`, `"protanomaly","deuteranomaly"`)
					.warnings,
			),
		).toHaveLength(0);
	});

	it("stays silent across every generated theme for the default palette", () => {
		// The check that catches what a per-theme probe cannot: a consumer
		// compiles ALL their themes at once, so a false alarm anywhere in the
		// set reaches them.
		expect(
			separationWarnings(
				compileThemeProbe(
					`("sky", 900)`,
					`"light","dark","protanopia","deuteranopia","protanomaly","deuteranomaly","tritanopia","tritanomaly"`,
				).warnings,
			),
		).toHaveLength(0);
	});

	it("does not fire on themes without status anchors", () => {
		// Tritanopia keeps red/green: no anchor, so nothing to report.
		expect(
			separationWarnings(
				compileThemeProbe(`("indigo", 600)`, `"tritanopia","light","dark"`)
					.warnings,
			),
		).toHaveLength(0);
	});
});
