/** @format */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LanguageState {
	language: "fr" | "en";
	version: string;
	setLanguage: (language: "fr" | "en") => void;
	setVersion: (version: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: "fr",
			version: "1.0.0",
			setLanguage: (language) => set({ language }),
			setVersion: (version) => set({ version }),
		}),
		{
			name: "language-storage",
		}
	)
);
