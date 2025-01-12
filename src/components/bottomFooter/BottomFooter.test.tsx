/** @format */
import { render, screen } from "@testing-library/react";
import BottomFooter from "./BottomFooter";
import "@testing-library/jest-dom";

jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
	}),
}));

describe("BottomFooter", () => {
	it("renders without crashing", () => {
		render(<BottomFooter />);
		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
	});

	it("displays correct navigation titles in French", () => {
		render(<BottomFooter />);
		expect(screen.getByText("Ressources & Réseaux")).toBeInTheDocument();
		expect(screen.getByText("Navigation")).toBeInTheDocument();
		expect(screen.getByText("Informations légales")).toBeInTheDocument();
	});

	it("contains navigation links with correct hrefs", () => {
		render(<BottomFooter />);
		const homeLink = screen.getByText("Accueil");
		expect(homeLink).toHaveAttribute("href", "/fr#main-content");
	});

	it("contains legal links", () => {
		render(<BottomFooter />);
		expect(screen.getByText("Plan du site")).toHaveAttribute(
			"href",
			"/fr/sitemap"
		);
		expect(screen.getByText("Mentions légales")).toHaveAttribute(
			"href",
			"/fr/legal"
		);
	});

	it("contains social links", () => {
		render(<BottomFooter />);
		expect(screen.getByText("LinkedIn")).toBeInTheDocument();
		expect(screen.getByText("GitHub")).toBeInTheDocument();
	});
});
