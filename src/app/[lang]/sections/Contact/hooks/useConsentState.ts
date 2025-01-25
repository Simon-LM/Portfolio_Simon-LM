/** @format */

import { create } from "zustand";

interface ConsentStore {
	hasConsent: boolean;
	setConsent: (value: boolean) => void;
}

export const useConsentStore = create<ConsentStore>((set) => ({
	hasConsent: false,
	setConsent: (value) => set({ hasConsent: value }),
}));
