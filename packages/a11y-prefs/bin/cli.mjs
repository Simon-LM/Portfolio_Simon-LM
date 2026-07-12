#!/usr/bin/env node
/** @format */

// CLI de scaffolding (chantier E6) — modèle shadcn : copie l'UI
// (déclencheur + carte + SCSS + config) DANS le projet du consommateur,
// qui la possède ensuite. Node pur, aucune dépendance.
//
//   init                Copie les templates dans <dir> (défaut ./a11y).
//   init --diff         Compare la copie locale à la référence du paquet.
//
// Options : --dir <chemin>  --pkg <nom-import>  --fonts <chemin>  --force

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, "..");
const TEMPLATES = join(PKG_ROOT, "templates");
const FONTS_SRC = join(PKG_ROOT, "fonts", "files");

// Nom d'import employé DANS les templates (nom de travail du paquet) ;
// réécrit vers le nom réellement installé par le consommateur.
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

// Liste récursive des fichiers d'un dossier (chemins relatifs à `base`).
function listFiles(base, sub = "") {
	const out = [];
	for (const entry of readdirSync(join(base, sub), { withFileTypes: true })) {
		const rel = join(sub, entry.name);
		if (entry.isDirectory()) out.push(...listFiles(base, rel));
		else out.push(rel);
	}
	return out;
}

// Contenu d'un template texte, nom d'import réécrit vers le nom installé.
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
	console.log(`${C.dim}UI copiée dans ${relative(process.cwd(), targetDir) || "."} (import: ${args.pkg})${C.reset}\n`);

	for (const rel of files) {
		const dest = join(targetDir, rel);
		if (existsSync(dest) && !args.force) {
			console.log(`  ${C.yellow}skip${C.reset}    ${rel} ${C.dim}(existe — --force pour écraser)${C.reset}`);
			skipped++;
			continue;
		}
		ensureDir(dirname(dest));
		writeFileSync(dest, renderTemplate(join(TEMPLATES, rel), args.pkg));
		console.log(`  ${C.green}write${C.reset}   ${rel}`);
		written++;
	}

	// Polices (référencées par accessibility-features.scss).
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
		console.log(`  ${C.green}fonts${C.reset}   ${fonts} fichier(s) → ${relative(process.cwd(), fontsDir)}`);
	}

	console.log(`\n${C.green}✓${C.reset} ${written} écrit(s), ${skipped} ignoré(s).`);
	console.log(`${C.cyan}Étapes suivantes :${C.reset}`);
	console.log(`  1. Dépendances UI : ${C.bold}react-select react-icons${C.reset} + le paquet ${C.bold}${args.pkg}${C.reset}`);
	console.log(`  2. Importez la SCSS (theme-example, accessibility-menu, -trigger, -features).`);
	console.log(`  3. Placez <AccessibilityControl/> DANS LE FLUX (votre header), pas en position:fixed.`);
	console.log(`  4. Lisez la notice ${C.bold}AGENTS.md${C.reset} copiée (contrat couche 3).\n`);
}

function cmdDiff(args) {
	const targetDir = resolve(process.cwd(), args.dir);
	const files = listFiles(TEMPLATES);
	let nw = 0, mod = 0, same = 0;

	console.log(`\n${C.bold}darkmode-plus-a11y — init --diff${C.reset}`);
	console.log(`${C.dim}Référence du paquet vs ${relative(process.cwd(), targetDir) || "."}${C.reset}\n`);

	for (const rel of files) {
		const dest = join(targetDir, rel);
		const ref = renderTemplate(join(TEMPLATES, rel), args.pkg);
		if (!existsSync(dest)) {
			console.log(`  ${C.cyan}new${C.reset}      ${rel} ${C.dim}(absent en local)${C.reset}`);
			nw++;
		} else if (readFileSync(dest, "utf8") !== ref) {
			console.log(`  ${C.yellow}modified${C.reset} ${rel} ${C.dim}(diffère de la référence)${C.reset}`);
			mod++;
		} else {
			same++;
		}
	}

	console.log(`\n${nw} nouveau(x), ${mod} modifié(s), ${same} identique(s).`);
	if (nw + mod > 0) {
		console.log(`${C.dim}Reportez à la main ce que vous voulez (rien n'est écrasé).${C.reset}\n`);
	}
}

function main() {
	const argv = process.argv.slice(2);
	const args = parseArgs(argv);
	const cmd = args._[0];

	if (cmd !== "init") {
		console.log(`Usage : darkmode-plus-a11y init [--diff] [--dir <chemin>] [--pkg <nom>] [--fonts <chemin>] [--force]`);
		process.exit(cmd ? 1 : 0);
	}
	if (args.diff) cmdDiff(args);
	else cmdInit(args);
}

main();
