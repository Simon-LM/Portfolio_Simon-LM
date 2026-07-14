/** @format */

import "./setup";

// PORTFOLIO's HC semantic audit (consumer config). The name-based
// inspector ENGINE lives in the package (darkmode-plus-a11y/testing/
// hc-semantic-audit, extracted pre-E7 — the portfolio is its first
// consumer, same pattern as the contrast pairs): here we keep only OUR
// calibration — the explicit slot mirror of our HC themes and our
// site-specific waivers, appended to the package's defaults.
//
// Usage: pnpm hc:audit  → console + docs/theme-system/HC-SEMANTIC-AUDIT.md

import * as fs from "node:fs";
import * as path from "node:path";
import { THEMES } from "../../config/themes";
import { getThemeVars } from "darkmode-plus-a11y/testing/extract-themes";
import {
	runHcSemanticAudit,
	formatHcAuditReport,
	defaultHcWaivers,
	type HcWaiver,
	type HcAuditFinding,
} from "darkmode-plus-a11y/testing/hc-semantic-audit";

// Re-exports for the test suite (the mechanics now live in the package).
export {
	segments,
	familyOf,
	pairBase,
} from "darkmode-plus-a11y/testing/hc-semantic-audit";
export type { HcAuditFinding as Finding };

// Slots per theme — MIRROR of src/styles/themes/_high-contrast*.scss.
// Explicit (not derived from the role variables) on purpose: the derived
// default maps `focus` to --focus-ring, which our HC themes wire to the
// link color — the canonical focus slot lives in the HC color map.
const HC_SLOTS: Record<string, Record<string, string>> = {
	"high-contrast": {
		background: "#000000",
		text: "#ffff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-green": {
		background: "#000000",
		text: "#00ff00",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-white": {
		background: "#000000",
		text: "#ffffff",
		link: "#00ffff",
		focus: "#ffffff",
	},
	"high-contrast-paper": {
		background: "#ffffff",
		text: "#000000",
		link: "#000099",
		focus: "#000000",
	},
};

// Site-specific waivers, appended to the package defaults (--fg-on-*,
// -inverse, --bg-emphasis-strong). Every new entry must be justified.
const SITE_WAIVERS: readonly HcWaiver[] = [
	{
		pattern: /^--color-header-text/,
		reason:
			"header text, sitting on the colored band (highlight): dark ink is legitimate",
	},
	{
		pattern: /^--color-lang-toggle-text-activated$/,
		reason: "active language button text, sitting on bg-emphasis (colored block)",
	},
	{
		pattern: /^--color-collapse-bg-title$/,
		reason:
			"collapse title bar = inverted emphasis block (text sitting on it in dark ink)",
	},
];

export function runAudit(): HcAuditFinding[] {
	return runHcSemanticAudit({
		themes: THEMES.filter((t) => t.startsWith("high-contrast")),
		varsFor: (theme) => getThemeVars().get(theme),
		slotsFor: (theme) => HC_SLOTS[theme],
		waivers: [...defaultHcWaivers, ...SITE_WAIVERS],
	});
}

// Direct execution (tsx)
if (require.main === module) {
	const findings = runAudit();
	const active = findings.filter((f) => !f.waived);
	const report = formatHcAuditReport(findings, "pnpm hc:audit");
	const out = path.resolve(
		__dirname,
		"../../../docs/theme-system/HC-SEMANTIC-AUDIT.md",
	);
	fs.writeFileSync(out, report);
	for (const f of active) {
		console.warn(
			`⚠️  [hc-audit] ${f.theme} ${f.name}: named "${f.family}" but emits ${f.value} (slot ${f.conflictingSlot})`,
		);
	}
	console.log(
		`hc-audit: ${active.length} active warning(s), ${
			findings.length - active.length
		} waived — report: ${out}`,
	);
}
