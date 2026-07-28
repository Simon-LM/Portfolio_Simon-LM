/** @jest-environment node */
/** @format */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	configureThemeExtraction,
	getThemeVars,
} from "darkmode-plus-a11y/testing/extract-themes";

// The two mistakes a consumer actually makes — a wrong entry path, and a
// Sass error in their own stylesheet — used to surface as an unhandled
// exception carrying Dart Sass's compiled stack, dozens of lines deep.
// These tests pin the readable form instead. They exercise the library
// layer, which is what both the `audit` CLI and a consumer's Jest setup
// go through.

let tmpDir: string;

beforeAll(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dma11y-extract-"));
});

afterAll(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("extract-themes error reporting", () => {
	it("names the missing entry instead of throwing from inside Sass", () => {
		const missing = path.join(tmpDir, "does-not-exist.scss");
		configureThemeExtraction({ entry: missing, loadPaths: [], themes: [] });

		expect(() => getThemeVars()).toThrow(/entry SCSS not found/);
		expect(() => getThemeVars()).toThrow(missing);
	});

	it("surfaces Sass's own message when the stylesheet is broken", () => {
		const broken = path.join(tmpDir, "broken.scss");
		// Undefined variable: Sass reports it with a source excerpt and a
		// line number, which is exactly what must survive.
		fs.writeFileSync(broken, "a { color: $nope; }\n");
		configureThemeExtraction({ entry: broken, loadPaths: [], themes: [] });

		expect(() => getThemeVars()).toThrow(/Sass failed to compile/);
		expect(() => getThemeVars()).toThrow(/Undefined variable/);
	});
});
