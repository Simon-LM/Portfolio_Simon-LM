/** @format */
"use client";

// Câblage des préférences d'accessibilité (template scaffoldé — vous le
// possédez, modifiez-le librement). Remplace les stores d'état par le hook
// générique `usePreference` du paquet : zéro dépendance d'état à installer.
//
// ⚠️ `a11y-prefs` = nom d'import du paquet. Le CLI le réécrit vers le nom
// que vous avez installé (par défaut « darkmode-plus-a11y ») lors de `init`.

import { usePreference } from "a11y-prefs/react";
import {
	applyFontSizeFactor,
	applyAccessibilityFont,
} from "a11y-prefs/react/appliers";

// Taille de texte en pourcentage (100 % = normal). Applique la variable
// CSS --font-size-factor ; vos tailles en rem/em la suivent (contrat hôte).
export function useFontSize() {
	return usePreference<number>("a11y-font-size", {
		defaultValue: 100,
		serialize: String,
		deserialize: Number,
		apply: applyFontSizeFactor,
	});
}

// Police d'accessibilité → classe DOM émise par le mixin `a11y-font-class`
// de votre SCSS. Pour ajouter une police : une entrée ici + un
// `@include a11y-font-class("ma-classe", "Ma Police")` côté SCSS.
export const ACCESSIBILITY_FONT_CLASSES: Readonly<Record<string, string>> = {
	opendyslexic: "dyslexic-font",
	atkinson: "atkinson-font",
	andika: "andika-font",
};

export function useAccessibilityFont() {
	return usePreference<string>("a11y-font", {
		defaultValue: "none",
		apply: (value) =>
			applyAccessibilityFont(value, ACCESSIBILITY_FONT_CLASSES),
	});
}
