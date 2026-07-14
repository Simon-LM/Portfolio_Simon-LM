/** @format */
"use client";

// Accessibility preferences wiring (scaffolded template — you own it, edit
// freely). Replaces state stores with the package's generic `usePreference`
// hook: zero state dependency to install.
//
// ⚠️ Imports use the published package name; `init --pkg <name>` rewrites
// them if you installed the package under a different name.

import { usePreference } from "darkmode-plus-a11y/react";
import {
	applyFontSizeFactor,
	applyAccessibilityFont,
} from "darkmode-plus-a11y/react/appliers";

// Text size as a percentage (100% = normal). Applies the CSS variable
// --font-size-factor; your rem/em sizes follow it (host contract).
export function useFontSize() {
	return usePreference<number>("a11y-font-size", {
		defaultValue: 100,
		serialize: String,
		deserialize: Number,
		apply: applyFontSizeFactor,
	});
}

// Accessibility font → DOM class emitted by your SCSS's `a11y-font-class`
// mixin. To add a font: one entry here + a
// `@include a11y-font-class("my-class", "My Font")` on the SCSS side.
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
