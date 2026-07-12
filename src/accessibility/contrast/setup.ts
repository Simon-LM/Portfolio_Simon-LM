/** @format */

// Configure le vérificateur de contrastes du paquet pour CE projet : point
// d'entrée SCSS, loadPaths, liste des thèmes. Effet de bord, à importer
// avant tout usage (jest.setup.js + les scripts report/audit).

import path from "node:path";
import { configureThemeExtraction } from "a11y-prefs/testing/extract-themes";
import { THEMES } from "../../config/themes";

configureThemeExtraction({
	entry: path.resolve(__dirname, "../../styles/main.scss"),
	loadPaths: [path.resolve(__dirname, "../../../node_modules")],
	themes: THEMES,
});
