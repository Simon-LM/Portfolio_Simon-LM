/** @format */
import { render, screen } from "@testing-library/react";
import StickyFooter from "./StickyFooter";
import "@testing-library/jest-dom";

// Mock du store de langue
jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
	}),
}));

describe("StickyFooter", () => {
	it("rend le footer", () => {
		render(<StickyFooter />);
		const footer = screen.getByRole("contentinfo");
		expect(footer).toBeInTheDocument();
	});

	it("affiche le texte d'accessibilité en français", () => {
		render(<StickyFooter />);
		expect(
			screen.getByText("Accessibilité : déclaration de conformité")
		).toBeInTheDocument();
	});

	// it("contient tous les liens sociaux", () => {
	// 	render(<StickyFooter />);
	// 	expect(screen.getByLabelText("Twitter")).toHaveAttribute(
	// 		"href",
	// 		"https://x.com/SimonLM_Dev"
	// 	);
	// 	expect(screen.getByLabelText("YouTube")).toHaveAttribute(
	// 		"href",
	// 		"https://www.youtube.com/@LostInTab"
	// 	);
	// 	expect(screen.getByLabelText("GitHub")).toHaveAttribute(
	// 		"href",
	// 		"https://github.com/Simon-LM"
	// 	);
	// 	expect(screen.getByLabelText("LinkedIn")).toHaveAttribute(
	// 		"href",
	// 		"https://www.linkedin.com/"
	// 	);
	// });

	it("vérifie les attributs d'accessibilité", () => {
		render(<StickyFooter />);
		const links = screen.getAllByRole("link");
		links.forEach((link) => {
			expect(link).toHaveAttribute("aria-label");
		});
	});

	it("vérifie les attributs de sécurité des liens externes", () => {
		render(<StickyFooter />);
		const externalLinks = screen.getAllByRole("link");
		externalLinks.forEach((link) => {
			if (link.getAttribute("target") === "_blank") {
				expect(link).toHaveAttribute("rel", "noopener noreferrer");
			}
		});
	});
});
