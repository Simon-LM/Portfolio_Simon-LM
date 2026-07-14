/** @format */

// CLI entry for the HC semantic audit (`darkmode-plus-a11y audit`).
// The CLI runs the COMPILED form (dist/testing/run-audit.js, CommonJS):
// Node refuses to type-strip files under node_modules
// (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING), so shipping raw TS to
// consumers is not an option for anything executed by plain Node. The
// CJS dist also frees the audit from any Node-version requirement.
//
// Usage:
//   darkmode-plus-a11y audit --entry styles/main.scss [--load-path node_modules]…
//     [--themes a,b] [--waive "regex=reason"]… [--out report.md] [--strict]

import * as fs from "node:fs";
import * as path from "node:path";
import {
	configureThemeExtraction,
	getThemeVars,
} from "./extract-themes";
import {
	runHcSemanticAudit,
	formatHcAuditReport,
	defaultHcWaivers,
	type HcWaiver,
} from "./hc-semantic-audit";

type Args = {
	entry?: string;
	loadPaths: string[];
	themes?: string[];
	waivers: HcWaiver[];
	out?: string;
	strict: boolean;
};

function parseArgs(argv: string[]): Args {
	const args: Args = { loadPaths: [], waivers: [], strict: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--entry") args.entry = argv[++i];
		else if (a === "--load-path") args.loadPaths.push(argv[++i]);
		else if (a === "--themes") args.themes = argv[++i].split(",").map((t) => t.trim());
		else if (a === "--out") args.out = argv[++i];
		else if (a === "--strict") args.strict = true;
		else if (a === "--waive") {
			const raw = argv[++i];
			const eq = raw.indexOf("=");
			if (eq === -1) {
				console.error(`audit: --waive expects "regex=reason", got "${raw}"`);
				process.exit(1);
			}
			args.waivers.push({
				pattern: new RegExp(raw.slice(0, eq)),
				reason: raw.slice(eq + 1),
			});
		}
	}
	return args;
}

function main(): void {
	const args = parseArgs(process.argv.slice(2));
	if (!args.entry) {
		console.error(
			"audit: --entry <path-to-scss> is required (the entry that emits the [data-theme] blocks).",
		);
		process.exit(1);
	}

	configureThemeExtraction({
		entry: path.resolve(process.cwd(), args.entry),
		loadPaths: args.loadPaths.map((p) => path.resolve(process.cwd(), p)),
		// Explicit list = validated; otherwise no validation, we auto-detect
		// the high-contrast themes among the extracted blocks below.
		themes: args.themes ?? [],
	});

	const allThemes = [...getThemeVars().keys()];
	const themes =
		args.themes ?? allThemes.filter((t) => t.startsWith("high-contrast"));
	if (themes.length === 0) {
		console.error(
			"audit: no high-contrast theme found in the compiled CSS (and no --themes given).",
		);
		process.exit(1);
	}

	const findings = runHcSemanticAudit({
		themes,
		varsFor: (t) => getThemeVars().get(t),
		waivers: [...defaultHcWaivers, ...args.waivers],
	});
	const active = findings.filter((f) => !f.waived);

	for (const f of active) {
		console.warn(
			`⚠️  [audit] ${f.theme} ${f.name}: named "${f.family}" but emits ${f.value} (slot ${f.conflictingSlot})`,
		);
	}

	if (args.out) {
		// Report generation on demand (same shape as the test-suite one).
		fs.writeFileSync(
			path.resolve(process.cwd(), args.out),
			formatHcAuditReport(findings, "darkmode-plus-a11y audit"),
		);
	}

	console.log(
		`audit: ${themes.length} theme(s), ${active.length} active warning(s), ${
			findings.length - active.length
		} waived${args.out ? ` — report: ${args.out}` : ""}`,
	);

	if (args.strict && active.length > 0) process.exit(1);
}

main();
