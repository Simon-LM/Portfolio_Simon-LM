/** @format */

import { render, screen } from "@testing-library/react";
import Header from "./Header";
import "@testing-library/jest-dom";

// Mock des images
jest.mock(
	"../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.webp",
	() => ({
		src: "test-file-stub",
	})
);

jest.mock(
	"../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.avif",
	() => ({
		src: "test-file-stub",
	})
);

jest.mock(
	"../../../public/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.png",
	() => ({
		src: "test-file-stub",
	})
);

jest.mock(
	"../../../public/Logo_LostInTab/LOGO_LostInTab_circle_60-60_2024.png",
	() => ({
		src: "test-file-stub",
	})
);

// Mock next/navigation
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
		refresh: jest.fn(),
	}),
}));

// Mock next/image
jest.mock("next/image", () => ({
	__esModule: true,
	default: function Image({
		src,
		alt,
		...props
	}: {
		src: string;
		alt: string;
		[key: string]: unknown;
	}) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt={alt} {...props} />;
	},
}));

// Mock useLanguageStore
jest.mock("../../store/langueStore", () => ({
	useLanguageStore: () => ({
		language: "fr",
		setLanguage: jest.fn(),
		version: "1.0",
		setVersion: jest.fn(),
	}),
}));

const mockDictionary = {
	header: {
		title: {
			name: "Simon LM",
			role: "Développeur Frontend",
		},
		blog: "LostInTab",
		accessibilityIcon: {
			alt: "Icône d'accessibilité",
			title: "Accessibilité",
		},
	},
};

describe("Header", () => {
	it("rend le header avec le titre correct", () => {
		render(<Header dictionary={mockDictionary} />);
		expect(screen.getByText("Simon LM")).toBeInTheDocument();
		expect(screen.getByText("Développeur Frontend")).toBeInTheDocument();
	});

	it("affiche le lien d'accessibilité", () => {
		render(<Header dictionary={mockDictionary} />);
		const skipLink = screen.getByText("Aller au contenu principal");
		expect(skipLink).toBeInTheDocument();
		expect(skipLink).toHaveAttribute("href", "#main-content");
	});

	it("affiche les boutons de changement de langue", () => {
		render(<Header dictionary={mockDictionary} />);
		expect(screen.getByText("FR")).toBeInTheDocument();
		expect(screen.getByText("EN")).toBeInTheDocument();
	});

	it("a le bon état des boutons de langue", () => {
		render(<Header dictionary={mockDictionary} />);
		const frButton = screen.getByText("FR");
		const enButton = screen.getByText("EN");

		expect(frButton).toBeDisabled();
		// expect(frButton).toHaveAttribute("aria-pressed", "true");
		expect(enButton).not.toBeDisabled();
		// expect(enButton).toHaveAttribute("aria-pressed", "false");
	});

	it("contient le lien YouTube avec les bons attributs", () => {
		render(<Header dictionary={mockDictionary} />);
		const youtubeLink = screen.getByText("LostInTab").closest("a");
		expect(youtubeLink).toHaveAttribute(
			"href",
			"https://www.youtube.com/@LostInTab"
		);
		expect(youtubeLink).toHaveAttribute("target", "_blank");
		expect(youtubeLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("affiche l'icône d'accessibilité avec les bons attributs alt", () => {
		render(<Header dictionary={mockDictionary} />);
		const accessibilityIcon = screen.getByRole("img", {
			name: "Icône d'accessibilité",
		});
		expect(accessibilityIcon).toBeInTheDocument();
		expect(accessibilityIcon).toHaveAttribute("alt", "Icône d'accessibilité");
	});
});
