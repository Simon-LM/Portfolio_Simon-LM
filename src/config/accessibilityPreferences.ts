/** @format */

// Storage keys and DOM class maps for the typography preferences.
//
// One value, one owner: the menu writes these keys through `usePreference`,
// and the anti-FOUC script reads the very same keys before the first paint.
// They previously lived in zustand `persist` stores, which wrap the value in
// a JSON envelope ({"state":{...},"version":0}). The boot script reads a
// plain value, so it found nothing and the size and font were only applied
// after hydration — one frame of unreadable text for the person who set
// their text to 150% precisely because they cannot read it smaller.
//
// No "use client" here: layout.tsx is a Server Component and imports
// A11Y_INIT_OPTIONS from this file. Same reason as @/config/themes. The
// hooks live in @/hooks/useAccessibilityPreferences.

import type { ColorVisionModesOption } from "darkmode-plus-a11y/react/detectThemes";

export const A11Y_FONT_SIZE_KEY = "a11y-font-size";
export const A11Y_FONT_KEY = "a11y-font";
export const A11Y_DYSLEXIA_KEY = "a11y-dyslexia";
export const A11Y_DYSLEXIA_CLASS = "dyslexia-optimized";

// Bounds enforced by the slider; repeated here because localStorage is
// user-writable and a NaN would land straight in --font-size-factor.
export const FONT_SIZE_MIN = 75;
export const FONT_SIZE_MAX = 150;
export const FONT_SIZE_DEFAULT = 100;

export type DyslexicFontType =
	| "none"
	| "opendyslexic"
	| "sylexiad"
	| "sylexiad-serif"
	| "atkinson"
	| "andika"
	| "tiresias"
	| "ralewaydots";

// Type → DOM class mapping. Sylexiad stays here (the site's font, not
// bundled in the package); tiresias/ralewaydots kept for identical DOM
// removal even though their options are no longer offered.
export const DYSLEXIC_FONT_CLASSES: Readonly<Record<string, string>> = {
	opendyslexic: "dyslexic-font",
	sylexiad: "sylexiad-font",
	"sylexiad-serif": "sylexiad-serif-font",
	atkinson: "atkinson-font",
	andika: "andika-font",
	tiresias: "tiresias-font",
	ralewaydots: "ralewaydots-font",
};

// Which colour-vision modes the menu offers.
//   "auto"  — read the loaded CSS: the site offers what it implements
//   "all"   — every mode the package knows, whatever the CSS says
//   [...]   — exactly these, in this order
// "auto" needs nothing maintained: remove a theme from the SCSS and its
// button goes with it.
export const COLOR_VISION_MODES: ColorVisionModesOption = "auto";

// Fonts offered by the menu, grouped by what they are FOR. The names
// mean nothing to most people — "OpenDyslexic" or "Andika" only tell you
// something if you already know them, so the heading above each group is
// what actually lets someone choose. "none" is not listed: it is the
// parent button's off state.
export type DyslexicFontGroupId = "dyslexic" | "legibility" | "easyReading";

export const DYSLEXIC_FONT_GROUPS: readonly {
	id: DyslexicFontGroupId;
	fonts: readonly DyslexicFontType[];
}[] = [
	{ id: "dyslexic", fonts: ["opendyslexic", "sylexiad", "sylexiad-serif"] },
	{ id: "legibility", fonts: ["atkinson"] },
	{ id: "easyReading", fonts: ["andika"] },
];

// Last colour-vision mode used, so the parent button can bring it back —
// same pattern as `hc-variant` for the high-contrast row.
export const A11Y_COLOR_VISION_KEY = "cv-mode";

// Second argument of themeInitScript: restores the typography before the
// first paint, like the theme already is.
export const A11Y_INIT_OPTIONS = {
	dyslexia: { key: A11Y_DYSLEXIA_KEY, className: A11Y_DYSLEXIA_CLASS },
	fontSizeKey: A11Y_FONT_SIZE_KEY,
	font: { key: A11Y_FONT_KEY, classes: DYSLEXIC_FONT_CLASSES },
} as const;
