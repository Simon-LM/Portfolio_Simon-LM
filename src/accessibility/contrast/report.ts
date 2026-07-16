/** @format */

import "./setup";

import fs from "node:fs";
import path from "node:path";

import { THEMES, type ThemeOption } from "../../config/themes";
import { contrastPairs, type ContrastPair } from "./contrast-pairs";
import { thresholdFor } from "darkmode-plus-a11y/testing/wcag";
import { measureRatio } from "darkmode-plus-a11y/testing/measure";

export const REPORT_PATH = path.resolve(
	__dirname,
	"../../../docs/theme-system/CONTRAST-REPORT.md",
);

const REGEN_COMMAND = "pnpm contrast:report";

// Short column headers keep the matrix readable; full names are in the legend.
const THEME_LABELS: Record<ThemeOption, string> = {
	light: "L",
	dark: "D",
	"anti-glare-light": "AGL",
	"anti-glare-dark": "AGD",
	"high-contrast": "HC",
	"high-contrast-green": "HCG",
	"high-contrast-white": "HCW",
	"high-contrast-paper": "HCP",
	deuteranomaly: "DA",
	deuteranopia: "DO",
	protanomaly: "PA",
	protanopia: "PO",
	tritanomaly: "TA",
	tritanopia: "TO",
	achromatopsia: "AC",
};

function cellFor(pair: ContrastPair, theme: ThemeOption): string {
	const applicable = (pair.themes ?? THEMES).includes(theme);
	if (!applicable) return "—";

	const ratio = measureRatio(pair, theme);
	const threshold = thresholdFor(pair.level);
	const waived = pair.waiver?.measured?.[theme] !== undefined;
	const symbol = waived ? "⚠" : ratio >= threshold ? "✓" : "✗";
	return `${symbol} ${ratio.toFixed(2)}`;
}

function buildLegend(): string {
	const lines = THEMES.map((theme) => `- \`${THEME_LABELS[theme]}\` — ${theme}`);
	return lines.join("\n");
}

function buildMatrix(): string {
	const header = `| Pair | ${THEMES.map((t) => THEME_LABELS[t]).join(" | ")} |`;
	const separator = `| --- | ${THEMES.map(() => "---").join(" | ")} |`;
	const rows = contrastPairs.map((pair) => {
		const label = `\`${pair.id}\` (${pair.level} ≥ ${thresholdFor(pair.level)})`;
		const cells = THEMES.map((theme) => cellFor(pair, theme));
		return `| ${label} | ${cells.join(" | ")} |`;
	});
	return [header, separator, ...rows].join("\n");
}

function buildWaiversSection(): string {
	const waived = contrastPairs.filter((pair) => pair.waiver);
	if (waived.length === 0) {
		return "No waivers currently recorded.";
	}

	const entries = waived.map((pair) => {
		const measured = pair.waiver!.measured ?? {};
		const perTheme = Object.entries(measured)
			.map(([theme, ratio]) => `\`${theme}\`: ${ratio.toFixed(4)}:1`)
			.join(", ");
		return [
			`### \`${pair.id}\``,
			"",
			`- Threshold: ${thresholdFor(pair.level)}:1 (${pair.level})`,
			`- Measured: ${perTheme}`,
			`- Reason: ${pair.waiver!.reason}`,
		].join("\n");
	});

	return entries.join("\n\n");
}

function todayLocal(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function generateReport(generatedOn: string = todayLocal()): string {
	return [
		"<!-- @format -->",
		"",
		"# Contrast report — WCAG 2.2 matrix",
		"",
		`Generated on: ${generatedOn} — regenerate with \`${REGEN_COMMAND}\`.`,
		"This file is a generated artifact (chantier E1,",
		"[PLAN-contrast-tests.md](./PLAN-contrast-tests.md)); do not edit by hand.",
		"",
		"Legend: ✓ compliant, ✗ failing (should not exist once phase 3 waivers are",
		"applied), ⚠ waived (see reason below). Cell value is the measured ratio.",
		"",
		"## Themes",
		"",
		buildLegend(),
		"",
		"## Matrix",
		"",
		buildMatrix(),
		"",
		"## Waivers",
		"",
		buildWaiversSection(),
		"",
	].join("\n");
}

if (require.main === module) {
	const content = generateReport();
	fs.writeFileSync(REPORT_PATH, content);
	console.log(`Written ${REPORT_PATH}`);
}
