/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const updateDyslexicFont = (type: DyslexicFontType) => {
	if (typeof document !== "undefined") {
		// Enlever TOUTES les classes de police
		document.documentElement.classList.remove(
			"dyslexic-font",
			"sylexiad-font",
			"sylexiad-serif-font",
			"atkinson-font",
			"andika-font",
			"tiresias-font",
			"ralewaydots-font"
		);

		// Ajouter la classe appropriée
		if (type === "opendyslexic") {
			document.documentElement.classList.add("dyslexic-font");
		} else if (type === "sylexiad") {
			document.documentElement.classList.add("sylexiad-font");
		} else if (type === "sylexiad-serif") {
			document.documentElement.classList.add("sylexiad-serif-font");
		} else if (type === "atkinson") {
			document.documentElement.classList.add("atkinson-font");
		} else if (type === "andika") {
			document.documentElement.classList.add("andika-font");
		} else if (type === "tiresias") {
			document.documentElement.classList.add("tiresias-font");
		} else if (type === "ralewaydots") {
			document.documentElement.classList.add("ralewaydots-font");
		}
	}
};

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
