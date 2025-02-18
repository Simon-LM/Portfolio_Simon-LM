/** @format */

import { render, screen, fireEvent } from "@testing-library/react";
import NavigationSticky from "./NavigationSticky";
import "@testing-library/jest-dom";

jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
	}),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
		refresh: jest.fn(),
		replace: jest.fn(),
	}),
}));

// Mock du LanguageSelector
jest.mock("../languageSelector/LanguageSelector", () => {
	return function MockLanguageSelector() {
		return (
			<div role="group" aria-label="Sélecteur de langue">
				<button aria-label="Passer au français" aria-pressed="true" disabled>
					Français
				</button>
				<button aria-label="Switch to English" aria-pressed="false">
					English
				</button>
			</div>
		);
	};
});

// Mock du store de langue
jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
		setLanguage: jest.fn(),
	}),
}));

// describe("NavigationSticky", () => {
// it("affiche les liens avec les bons href", () => {
// 	render(<NavigationSticky />);
// 	const menuButton = screen.getByLabelText("Menu");
// 	fireEvent.click(menuButton);
// 	expect(screen.getByText("Accueil")).toHaveAttribute(
// 		"href",
// 		"/fr#main-content"
// 	);
// 	expect(screen.getByText("Portfolio")).toHaveAttribute(
// 		"href",
// 		"/fr#portfolio"
// 	);
// });
// it("contient le sélecteur de langue", () => {
// 	render(<NavigationSticky />);
// 	const menuButton = screen.getByLabelText("Menu");
// 	fireEvent.click(menuButton);
// 	expect(screen.getByText("Français")).toBeInTheDocument();
// 	expect(screen.getByText("English")).toBeInTheDocument();
// });
// it("a les attributs ARIA corrects pour le sélecteur de langue", () => {
// 	render(<NavigationSticky />);
// 	const menuButton = screen.getByLabelText("Menu");
// 	fireEvent.click(menuButton);
// 	expect(screen.getByLabelText("Passer au français")).toBeDisabled();
// 	expect(screen.getByLabelText("Switch to English")).toBeEnabled();
// });
// });
