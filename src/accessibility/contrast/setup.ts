/** @format */

// Configures the package's contrast verifier for THIS project: SCSS entry
// point, loadPaths, theme list. Side effect, import before any use
// (jest.setup.js + the report/audit scripts).

import path from "node:path";
import { configureThemeExtraction } from "darkmode-plus-a11y/testing/extract-themes";
import { THEMES } from "../../config/themes";

configureThemeExtraction({
	entry: path.resolve(__dirname, "../../styles/main.scss"),
	loadPaths: [path.resolve(__dirname, "../../../node_modules")],
	themes: THEMES,
});
