/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyFontSizeFactor } from "a11y-prefs/react/appliers";

interface FontSizeState {
	fontSize: number; // en pourcentage (100% = taille normale)
	increaseFontSize: () => void;
	decreaseFontSize: () => void;
	setFontSize: (size: number) => void;
}

// Délègue l'application DOM à l'applier du paquet (E5) — comportement
// identique (pose --font-size-factor = size/100, SSR-safe).
const updateDocumentFontSize = applyFontSizeFactor;

export const useFontSizeStore = create<FontSizeState>()(
	persist(
		(set) => ({
			fontSize: 100,
			increaseFontSize: () =>
				set((state) => {
					const newSize = Math.min(state.fontSize + 10, 150);
					updateDocumentFontSize(newSize);
					return { fontSize: newSize };
				}),
			decreaseFontSize: () =>
				set((state) => {
					const newSize = Math.max(state.fontSize - 10, 75);
					updateDocumentFontSize(newSize);
					return { fontSize: newSize };
				}),
			setFontSize: (size) =>
				set(() => {
					updateDocumentFontSize(size);
					return { fontSize: size };
				}),
		}),
		{
			name: "font-size-storage",
		}
	)
);
