/** @format */
"use client";

import { useState, useEffect } from "react";

export type UsePreferenceOptions<T> = {
	/** Value used on the server and when localStorage has no entry. */
	defaultValue: T;
	/** T -> string for localStorage (default: String). */
	serialize?: (value: T) => string;
	/** string -> T from localStorage (default: identity cast, for string T). */
	deserialize?: (raw: string) => T;
	/** DOM side effect applied on init and on every change (SSR-safe). */
	apply: (value: T) => void;
};

// Generic accessibility-preference hook (chantier E5, generalises the
// pattern of useTheme/fontSize/reduceMotion): lazy read from localStorage,
// DOM application, persistent setter. The `apply` callback is the only
// project-specific side effect. Returns a [value, setValue] tuple.
export function usePreference<T>(key: string, options: UsePreferenceOptions<T>) {
	const { defaultValue, serialize = String, deserialize, apply } = options;

	const read = (): T => {
		if (typeof window === "undefined") return defaultValue;
		const raw = localStorage.getItem(key);
		if (raw === null) return defaultValue;
		return deserialize ? deserialize(raw) : (raw as unknown as T);
	};

	const [value, setValue] = useState<T>(read);

	const set = (next: T) => {
		if (typeof window !== "undefined") {
			localStorage.setItem(key, serialize(next));
		}
		apply(next);
		setValue(next);
	};

	// Apply the (lazily read) initial value to the DOM once, client-side.
	useEffect(() => {
		apply(read());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return [value, set] as const;
}
