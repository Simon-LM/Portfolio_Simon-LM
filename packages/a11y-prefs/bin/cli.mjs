#!/usr/bin/env node
/** @format */

// Scaffolding CLI (E6) — shadcn model: copies the UI (trigger + card +
// SCSS + config) INTO the consumer's project, which then owns it. Pure
// Node, no dependency.
//
//   init                Copies the templates into <dir> (default ./a11y).
//   init --diff         Compares the local copy against the package's reference.
//
// Options: --dir <path>  --pkg <import-name>  --fonts <path>  --force

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, "..");
const TEMPLATES = join(PKG_ROOT, "templates");
const FONTS_SRC = join(PKG_ROOT, "fonts", "files");

// Import name used INSIDE the templates (the package's working name);
// rewritten to the name actually installed by the consumer.
const SOURCE_IMPORT = "a11y-prefs";

const C = {
	reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
	green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m",
};

function parseArgs(argv) {
	const args = { _: [], diff: false, force: false, dir: "./a11y", pkg: "darkmode-plus-a11y", fonts: "./public/fonts" };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--diff") args.diff = true;
		else if (a === "--force") args.force = true;
		else if (a === "--dir") args.dir = argv[++i];
		else if (a === "--pkg") args.pkg = argv[++i];
		else if (a === "--fonts") args.fonts = argv[++i];
		else args._.push(a);
	}
	return args;
}

// Recursive file listing for a folder (paths relative to `base`).
function listFiles(base, sub = "") {
	const out = [];
	for (const entry of readdirSync(join(base, sub), { withFileTypes: true })) {
		const rel = join(sub, entry.name);
		if (entry.isDirectory()) out.push(...listFiles(base, rel));
		else out.push(rel);
	}
	return out;
}

// Content of a text template, import name rewritten to the installed name.
function renderTemplate(absPath, pkgName) {
	const raw = readFileSync(absPath, "utf8");
	return raw.split(SOURCE_IMPORT).join(pkgName);
}

function ensureDir(p) {
	mkdirSync(p, { recursive: true });
}

function cmdInit(args) {
	const targetDir = resolve(process.cwd(), args.dir);
	const files = listFiles(TEMPLATES);
	let written = 0, skipped = 0;

	console.log(`\n${C.bold}darkmode-plus-a11y — init${C.reset}`);
	console.log(`${C.dim}UI copied into ${relative(process.cwd(), targetDir) || "."} (import: ${args.pkg})${C.reset}\n`);

	for (const rel of files) {
		const dest = join(targetDir, rel);
		if (existsSync(dest) && !args.force) {
			console.log(`  ${C.yellow}skip${C.reset}    ${rel} ${C.dim}(exists — use --force to overwrite)${C.reset}`);
			skipped++;
			continue;
		}
		ensureDir(dirname(dest));
		writeFileSync(dest, renderTemplate(join(TEMPLATES, rel), args.pkg));
		console.log(`  ${C.green}write${C.reset}   ${rel}`);
		written++;
	}

	// Fonts (referenced by accessibility-features.scss).
	const fontsDir = resolve(process.cwd(), args.fonts);
	if (existsSync(FONTS_SRC)) {
		ensureDir(fontsDir);
		let fonts = 0;
		for (const f of readdirSync(FONTS_SRC)) {
			const dest = join(fontsDir, f);
			if (existsSync(dest) && !args.force) continue;
			copyFileSync(join(FONTS_SRC, f), dest);
			fonts++;
		}
		console.log(`  ${C.green}fonts${C.reset}   ${fonts} file(s) → ${relative(process.cwd(), fontsDir)}`);
	}

	console.log(`\n${C.green}✓${C.reset} ${written} written, ${skipped} skipped.`);
	console.log(`${C.cyan}Next steps:${C.reset}`);
	console.log(`  1. UI dependencies: ${C.bold}react-select react-icons${C.reset} + the ${C.bold}${args.pkg}${C.reset} package`);
	console.log(`  2. Import the SCSS (theme-example, accessibility-menu, -trigger, -features).`);
	console.log(`  3. Place <AccessibilityControl/> IN THE FLOW (your header), not as position:fixed.`);
	console.log(`  4. Read the copied ${C.bold}AGENTS.md${C.reset} guide (layer-3 contract).\n`);
}

function cmdDiff(args) {
	const targetDir = resolve(process.cwd(), args.dir);
	const files = listFiles(TEMPLATES);
	let nw = 0, mod = 0, same = 0;

	console.log(`\n${C.bold}darkmode-plus-a11y — init --diff${C.reset}`);
	console.log(`${C.dim}Package reference vs ${relative(process.cwd(), targetDir) || "."}${C.reset}\n`);

	for (const rel of files) {
		const dest = join(targetDir, rel);
		const ref = renderTemplate(join(TEMPLATES, rel), args.pkg);
		if (!existsSync(dest)) {
			console.log(`  ${C.cyan}new${C.reset}      ${rel} ${C.dim}(missing locally)${C.reset}`);
			nw++;
		} else if (readFileSync(dest, "utf8") !== ref) {
			console.log(`  ${C.yellow}modified${C.reset} ${rel} ${C.dim}(differs from the reference)${C.reset}`);
			mod++;
		} else {
			same++;
		}
	}

	console.log(`\n${nw} new, ${mod} modified, ${same} unchanged.`);
	if (nw + mod > 0) {
		console.log(`${C.dim}Port over by hand whatever you want (nothing is overwritten).${C.reset}\n`);
	}
}

function main() {
	const argv = process.argv.slice(2);
	const args = parseArgs(argv);
	const cmd = args._[0];

	if (cmd !== "init") {
		console.log(`Usage: darkmode-plus-a11y init [--diff] [--dir <path>] [--pkg <name>] [--fonts <path>] [--force]`);
		process.exit(cmd ? 1 : 0);
	}
	if (args.diff) cmdDiff(args);
	else cmdInit(args);
}

main();
