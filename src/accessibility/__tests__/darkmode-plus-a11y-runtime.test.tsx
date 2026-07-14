/** @format */

import { renderHook, act } from "@testing-library/react";
import {
	applyFontSizeFactor,
	applyAccessibilityFont,
	applyReduceMotion,
	usePreference,
} from "darkmode-plus-a11y/react";

// Runtime module tests (chantier E5): the DOM appliers the portfolio stores
// now delegate to, plus the generic usePreference hook.

describe("appliers", () => {
	beforeEach(() => {
		document.documentElement.removeAttribute("style");
		document.documentElement.className = "";
	});

	it("applyFontSizeFactor sets --font-size-factor = percent/100", () => {
		applyFontSizeFactor(125);
		expect(
			document.documentElement.style.getPropertyValue("--font-size-factor"),
		).toBe("1.25");
	});

	const CLASSES = {
		opendyslexic: "dyslexic-font",
		sylexiad: "sylexiad-font",
		atkinson: "atkinson-font",
		andika: "andika-font",
	};

	it("applyAccessibilityFont swaps to a single class", () => {
		applyAccessibilityFont("atkinson", CLASSES);
		expect(document.documentElement.classList.contains("atkinson-font")).toBe(true);
		applyAccessibilityFont("andika", CLASSES);
		expect(document.documentElement.classList.contains("atkinson-font")).toBe(false);
		expect(document.documentElement.classList.contains("andika-font")).toBe(true);
	});

	it("applyAccessibilityFont('none', …) clears all classes", () => {
		applyAccessibilityFont("sylexiad", CLASSES);
		applyAccessibilityFont("none", CLASSES);
		expect(document.documentElement.className).toBe("");
	});

	it("applyReduceMotion toggles the class", () => {
		applyReduceMotion(true);
		expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
		applyReduceMotion(false);
		expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
	});
});

describe("usePreference", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute("style");
	});

	it("reads the default, applies it, and persists on set", () => {
		const applied: number[] = [];
		const { result } = renderHook(() =>
			usePreference<number>("font-size-storage-test", {
				defaultValue: 100,
				serialize: String,
				deserialize: Number,
				apply: (v) => applied.push(v),
			}),
		);

		expect(result.current[0]).toBe(100); // default
		expect(applied).toContain(100); // applied on mount

		act(() => result.current[1](125));
		expect(result.current[0]).toBe(125);
		expect(localStorage.getItem("font-size-storage-test")).toBe("125");
		expect(applied).toContain(125);
	});

	it("reads an existing localStorage value on init", () => {
		localStorage.setItem("pref-x", "dark");
		const { result } = renderHook(() =>
			usePreference<string>("pref-x", { defaultValue: "light", apply: () => {} }),
		);
		expect(result.current[0]).toBe("dark");
	});
});
