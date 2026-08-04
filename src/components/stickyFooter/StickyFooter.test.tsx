/** @format */
import { render, screen } from "@testing-library/react";
import StickyFooter from "./StickyFooter";
import "@testing-library/jest-dom";

// Mock of the language store
jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
	}),
}));

describe("StickyFooter", () => {
	it("renders the footer", () => {
		render(<StickyFooter />);
		const footer = screen.getByRole("contentinfo");
		expect(footer).toBeInTheDocument();
	});

	it("displays the accessibility text in French", () => {
		render(<StickyFooter />);
		expect(
			screen.getByText("Accessibilité : déclaration de conformité")
		).toBeInTheDocument();
	});

	it("checks the accessibility attributes", () => {
		render(<StickyFooter />);
		const links = screen.getAllByRole("link");
		links.forEach((link) => {
			expect(link).toHaveAttribute("aria-label");
		});
	});

	it("checks the security attributes of external links", () => {
		render(<StickyFooter />);
		const externalLinks = screen.getAllByRole("link");
		externalLinks.forEach((link) => {
			if (link.getAttribute("target") === "_blank") {
				expect(link).toHaveAttribute("rel", "noopener noreferrer");
			}
		});
	});
});
