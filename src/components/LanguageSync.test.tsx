/** @format */

import { render, act } from "@testing-library/react";
import { LanguageSync } from "./LanguageSync";
import { useLanguageStore } from "../store/langueStore";

// Reset store between tests
beforeEach(() => {
	useLanguageStore.setState({ language: "en", version: "1.0.0" });
});

describe("LanguageSync", () => {
	it("sets store language to match URL lang on first render", () => {
		expect(useLanguageStore.getState().language).toBe("en");

		render(<LanguageSync lang="fr" />);

		expect(useLanguageStore.getState().language).toBe("fr");
	});

	it("keeps store language when it already matches URL lang", () => {
		useLanguageStore.setState({ language: "en" });

		render(<LanguageSync lang="en" />);

		expect(useLanguageStore.getState().language).toBe("en");
	});

	it("updates store language when lang prop changes", () => {
		const { rerender } = render(<LanguageSync lang="fr" />);
		expect(useLanguageStore.getState().language).toBe("fr");

		rerender(<LanguageSync lang="en" />);
		expect(useLanguageStore.getState().language).toBe("en");
	});

	it("overrides store after Zustand persist rehydration", async () => {
		render(<LanguageSync lang="fr" />);
		expect(useLanguageStore.getState().language).toBe("fr");

		// Simulate persist rehydration setting a different language then firing callback
		await act(async () => {
			useLanguageStore.setState({ language: "en" });
			// Trigger the rehydration event that LanguageSync subscribed to
			await useLanguageStore.persist.rehydrate();
		});

		expect(useLanguageStore.getState().language).toBe("fr");
	});

	it("renders nothing (returns null)", () => {
		const { container } = render(<LanguageSync lang="fr" />);
		expect(container.innerHTML).toBe("");
	});

	it("does not modify other store properties", () => {
		useLanguageStore.setState({ version: "2.0.0" });

		render(<LanguageSync lang="fr" />);

		expect(useLanguageStore.getState().version).toBe("2.0.0");
		expect(useLanguageStore.getState().language).toBe("fr");
	});
});
