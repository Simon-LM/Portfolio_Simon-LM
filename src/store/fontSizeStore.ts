/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyFontSizeFactor } from "darkmode-plus-a11y/react/appliers";

interface FontSizeState {
	fontSize: number; // as a percentage (100% = normal size)
	increaseFontSize: () => void;
	decreaseFontSize: () => void;
	setFontSize: (size: number) => void;
}

// Delegates DOM application to the package's applier (E5) — identical
// behavior (sets --font-size-factor = size/100, SSR-safe).
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
