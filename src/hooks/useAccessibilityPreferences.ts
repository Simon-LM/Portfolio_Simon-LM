/** @format */
"use client";

import { usePreference } from "darkmode-plus-a11y/react";
import {
	applyFontSizeFactor,
	applyAccessibilityFont,
} from "darkmode-plus-a11y/react/appliers";
import {
	A11Y_FONT_KEY,
	A11Y_FONT_SIZE_KEY,
	DYSLEXIC_FONT_CLASSES,
	FONT_SIZE_DEFAULT,
	FONT_SIZE_MAX,
	FONT_SIZE_MIN,
	type DyslexicFontType,
} from "@/config/accessibilityPreferences";

// Replaces the zustand `persist` stores. Same behaviour for the user, but
// the value is now written the way the anti-FOUC script reads it, so the
// size and the font survive a reload without waiting for hydration.

// --- Legacy migration -------------------------------------------------
// zustand `persist` stored {"state":{"fontSize":150},"version":0}. Read it
// once, rewrite it as a plain value, drop the old key. A visitor who had
// set a size keeps it instead of silently falling back to 100%.
// Removable once the old keys can no longer be in anyone's browser.

const readLegacy = (storeKey: string, field: string): string | null => {
	try {
		const raw = localStorage.getItem(storeKey);
		if (raw === null) return null;
		const value = (JSON.parse(raw) as { state?: Record<string, unknown> })
			?.state?.[field];
		return value === undefined || value === null ? null : String(value);
	} catch {
		// Corrupted or hand-edited entry: not worth failing a page load over.
		return null;
	}
};

const migrateLegacyStore = (
	storeKey: string,
	field: string,
	target: string,
) => {
	const value = readLegacy(storeKey, field);
	if (value !== null && localStorage.getItem(target) === null) {
		localStorage.setItem(target, value);
	}
	localStorage.removeItem(storeKey);
};

// Module scope: runs before the first render, so the hooks below already
// read the migrated value.
if (typeof window !== "undefined") {
	migrateLegacyStore("font-size-storage", "fontSize", A11Y_FONT_SIZE_KEY);
	migrateLegacyStore("dyslexic-font-storage", "fontType", A11Y_FONT_KEY);
}

// --- Preferences ------------------------------------------------------

// Text size as a percentage (100% = normal). Applies --font-size-factor;
// the rem/em sizes across the site follow it.
export function useFontSize() {
	return usePreference<number>(A11Y_FONT_SIZE_KEY, {
		defaultValue: FONT_SIZE_DEFAULT,
		serialize: String,
		// localStorage is user-writable: an unparseable entry must not put
		// NaN into the CSS variable and blank the page.
		deserialize: (raw) => {
			const size = Number(raw);
			if (!Number.isFinite(size)) return FONT_SIZE_DEFAULT;
			return Math.min(Math.max(size, FONT_SIZE_MIN), FONT_SIZE_MAX);
		},
		apply: applyFontSizeFactor,
	});
}

export function useDyslexicFont() {
	return usePreference<DyslexicFontType>(A11Y_FONT_KEY, {
		defaultValue: "none",
		serialize: String,
		deserialize: (raw) =>
			raw in DYSLEXIC_FONT_CLASSES ? (raw as DyslexicFontType) : "none",
		apply: (value) => applyAccessibilityFont(value, DYSLEXIC_FONT_CLASSES),
	});
}
