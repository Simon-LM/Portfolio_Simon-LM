/** @jest-environment node */
/** @format */

import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// Anti-drift guard (chantier E5): every font file bundled in the package
// (packages/a11y-prefs/fonts/files/) must be byte-identical to the copy the
// portfolio serves from public/fonts/. The package fonts are a copy, not a
// move — until the E6 CLI owns installation, the two must not diverge.
const projectRoot = path.resolve(__dirname, "../../../..");
const PKG_FONTS = path.join(projectRoot, "packages/a11y-prefs/fonts/files");
const PUBLIC_FONTS = path.join(projectRoot, "public/fonts");

function sha(file: string): string {
	return createHash("sha256").update(readFileSync(file)).digest("hex");
}

describe("bundled fonts stay identical to public/fonts", () => {
	const bundled = readdirSync(PKG_FONTS).filter(
		(f) => f.endsWith(".woff2") || f.endsWith(".ttf") || f.endsWith(".otf"),
	);

	it("bundles at least the expected font families", () => {
		const families = new Set(bundled.map((f) => f.split("-")[0].split(".")[0]));
		for (const fam of ["OpenDyslexic", "Andika", "AtkinsonHyperlegibleNextVF", "LexendGiga", "LexendDeca"]) {
			expect([...families].some((x) => x.startsWith(fam.slice(0, 6)))).toBe(true);
		}
	});

	it("never bundles an excluded (non-redistributable / unused) font", () => {
		const forbidden = bundled.filter((f) => /sylexiad|tiresias|raleway/i.test(f));
		expect(forbidden).toEqual([]);
	});

	for (const file of bundled) {
		it(`${file} matches public/fonts`, () => {
			const publicCopy = path.join(PUBLIC_FONTS, file);
			expect(sha(path.join(PKG_FONTS, file))).toBe(sha(publicCopy));
		});
	}
});
