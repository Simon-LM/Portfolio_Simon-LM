/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAccessibilityFont } from "darkmode-plus-a11y/react/appliers";

type DyslexicFontType =
	| "none"
	| "opendyslexic"
	| "sylexiad"
	| "sylexiad-serif"
	| "atkinson"
	| "andika"
	| "tiresias"
	| "ralewaydots";

interface DyslexicFontState {
	fontType: DyslexicFontType;
	setFontType: (type: DyslexicFontType) => void;
}

// Type → DOM class mapping. Sylexiad stays here (the site's font, not
// bundled in the package); tiresias/ralewaydots kept for identical DOM
// removal even though their options are no longer offered.
const DYSLEXIC_FONT_CLASSES: Readonly<Record<string, string>> = {
	opendyslexic: "dyslexic-font",
	sylexiad: "sylexiad-font",
	"sylexiad-serif": "sylexiad-serif-font",
	atkinson: "atkinson-font",
	andika: "andika-font",
	tiresias: "tiresias-font",
	ralewaydots: "ralewaydots-font",
};

// Delegates DOM application to the package's applier (E5) — identical
// behavior (removes every class, sets the right one, SSR-safe).
const updateDyslexicFont = (type: DyslexicFontType) =>
	applyAccessibilityFont(type, DYSLEXIC_FONT_CLASSES);

export const useDyslexicFontStore = create<DyslexicFontState>()(
	persist(
		(set) => ({
			fontType: "none",
			setFontType: (type) => {
				updateDyslexicFont(type);
				set({ fontType: type });
			},
		}),
		{
			name: "dyslexic-font-storage",
		}
	)
);
