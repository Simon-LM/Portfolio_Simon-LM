/** @format */
"use client";

import { useSyncExternalStore } from "react";

// Subscribe to prefers-color-scheme media query changes
function subscribe(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	const mq = window.matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

// Returns current dark-mode preference from the browser
function getSnapshot(): boolean {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Server-side default: assume light mode (avoids hydration mismatch)
function getServerSnapshot(): boolean {
	return false;
}

/**
 * Hook that detects the system dark-mode preference.
 * Uses useSyncExternalStore to correctly handle SSR and live media-query updates.
 * @returns boolean - true if the user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
