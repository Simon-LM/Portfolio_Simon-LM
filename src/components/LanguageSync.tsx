/** @format */

"use client";

import { useEffect, useRef } from "react";
import { useLanguageStore } from "../store/langueStore";

export function LanguageSync({ lang }: { lang: "fr" | "en" }) {
	const hasInitialized = useRef(false);

	// Sync synchronously on first render — before children read the store
	if (!hasInitialized.current) {
		hasInitialized.current = true;
		useLanguageStore.setState({ language: lang });
	}

	// Re-sync after Zustand persist rehydration overrides with localStorage value
	useEffect(() => {
		const unsub = useLanguageStore.persist.onFinishHydration(() => {
			useLanguageStore.setState({ language: lang });
		});
		return unsub;
	}, [lang]);

	// Sync when URL lang changes (navigation between /fr and /en)
	useEffect(() => {
		useLanguageStore.setState({ language: lang });
	}, [lang]);

	return null;
}
