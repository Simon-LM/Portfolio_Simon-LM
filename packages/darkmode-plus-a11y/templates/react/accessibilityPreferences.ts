/** @format */
"use client";

// Accessibility preferences wiring (scaffolded template — you own it, edit
// freely). Replaces state stores with the package's generic `usePreference`
// hook: zero state dependency to install.
//
// ⚠️ Imports use the published package name; `init --pkg <name>` rewrites
// them if you installed the package under a different name.

import { usePreference } from "darkmode-plus-a11y/react";
import type { ColorVisionModesOption } from "darkmode-plus-a11y/react";
import {
	applyFontSizeFactor,
	applyAccessibilityFont,
} from "darkmode-plus-a11y/react/appliers";

// Storage keys, in one place: the menu writes them, and the anti-FOUC
// script reads them before the first paint. Two readers, so they must not
// drift apart.
export const A11Y_FONT_SIZE_KEY = "a11y-font-size";
export const A11Y_FONT_KEY = "a11y-font";
export const A11Y_DYSLEXIA_KEY = "a11y-dyslexia";
export const A11Y_DYSLEXIA_CLASS = "dyslexia-optimized";

// Last colour-vision mode used, so the parent button can bring it back —
// same pattern as `hc-variant` for the high-contrast row.
export const A11Y_COLOR_VISION_KEY = "cv-mode";

// Which colour-vision modes the menu offers.
//   "auto"  — read the loaded CSS: the site offers what it implements
//   "all"   — every mode the package knows, whatever the CSS says
//   [...]   — exactly these, in this order
//
// "auto" needs nothing maintained: remove a theme from your SCSS and its
// button goes with it. A button for a theme whose [data-theme] block does
// not exist is not a missing option — the user presses it and nothing
// happens, which for someone with a colour vision deficiency is a broken
// promise rather than a gap.
export const COLOR_VISION_MODES: ColorVisionModesOption = "auto";

// Text size as a percentage (100% = normal). Applies the CSS variable
// --font-size-factor; your rem/em sizes follow it (host contract).
export function useFontSize() {
	return usePreference<number>(A11Y_FONT_SIZE_KEY, {
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
	return usePreference<string>(A11Y_FONT_KEY, {
		defaultValue: "none",
		apply: (value) =>
			applyAccessibilityFont(value, ACCESSIBILITY_FONT_CLASSES),
	});
}

// Fonts offered by the menu, grouped by what they are FOR. The names mean
// nothing to most people — "OpenDyslexic" or "Andika" only tell you
// something if you already know them, so the heading above each group is
// what actually lets someone choose. "none" is not listed: it is the
// parent button's off state.
export type FontGroupId = "dyslexic" | "legibility" | "easyReading";

export const ACCESSIBILITY_FONT_GROUPS: readonly {
	id: FontGroupId;
	fonts: readonly string[];
}[] = [
	{ id: "dyslexic", fonts: ["opendyslexic"] },
	{ id: "legibility", fonts: ["atkinson"] },
	{ id: "easyReading", fonts: ["andika"] },
];

// Pass this as themeInitScript's second argument so the typography
// preferences are restored BEFORE the first paint, like the theme already
// is. Without it they are applied after hydration, and a visitor reading at
// 200% gets a frame of unreadable text on every page load.
//
//   themeInitScript(THEMES, A11Y_INIT_OPTIONS)
export const A11Y_INIT_OPTIONS = {
	dyslexia: { key: A11Y_DYSLEXIA_KEY, className: A11Y_DYSLEXIA_CLASS },
	fontSizeKey: A11Y_FONT_SIZE_KEY,
	font: { key: A11Y_FONT_KEY, classes: ACCESSIBILITY_FONT_CLASSES },
} as const;
