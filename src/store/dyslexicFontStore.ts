/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAccessibilityFont } from "a11y-prefs/react/appliers";

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

// Correspondance type → classe DOM. Sylexiad reste ici (police du site, non
// embarquée dans le paquet) ; tiresias/ralewaydots conservés pour un retrait
// DOM identique même si leurs options ne sont plus offertes.
const DYSLEXIC_FONT_CLASSES: Readonly<Record<string, string>> = {
	opendyslexic: "dyslexic-font",
	sylexiad: "sylexiad-font",
	"sylexiad-serif": "sylexiad-serif-font",
	atkinson: "atkinson-font",
	andika: "andika-font",
	tiresias: "tiresias-font",
	ralewaydots: "ralewaydots-font",
};

// Délègue l'application DOM à l'applier du paquet (E5) — comportement
// identique (retire toutes les classes, pose la bonne, SSR-safe).
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
