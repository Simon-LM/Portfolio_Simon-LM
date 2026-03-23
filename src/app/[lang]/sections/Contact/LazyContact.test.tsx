/** @format */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LazyContact } from "./LazyContact";

// Mock next/dynamic to render the component directly
jest.mock("next/dynamic", () => {
	return function mockDynamic(loader: () => Promise<{ default: React.ComponentType }>) {
		let Component: React.ComponentType | null = null;
		const promise = loader();
		promise.then((mod) => {
			Component = mod.default;
		});
		// Return a wrapper that renders the loaded component
		return function DynamicComponent(props: Record<string, unknown>) {
			if (!Component) return null;
			return <Component {...props} />;
		};
	};
});

// Mock react-intersection-observer
let mockInView = false;
jest.mock("react-intersection-observer", () => ({
	useInView: () => ({
		ref: jest.fn(),
		inView: mockInView,
	}),
}));

// Mock react-hot-toast (needed by ContactClient)
jest.mock("react-hot-toast", () => ({
	Toaster: () => null,
	toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock generateMetadata
jest.mock("../../../../utils/metadata", () => ({
	generateMetadata: () => ({ date: "22/03/2026", heure: "10:00", langue: "fr" }),
}));

const mockDictionary = {
	title: "Contact",
	subtitle: "Get in touch",
	loading: "Loading...",
	form: {
		firstName: "First Name",
		lastName: "Last Name",
		optional: "optional",
		phone: "Phone",
		company: "Company",
		email: "Email",
		emailFormat: "Expected format",
		phoneFormat: { line1: "Format 1", line2: "Format 2" },
		subject: "Subject",
		message: "Message",
		submit: "Send",
		sending: "Sending...",
		success: "Sent!",
		error: "Error",
		errors: {
			firstName: "",
			lastName: "",
			email: "",
			subject: "",
			message: "",
			gdpr: "",
		},
		gdpr: { text: "", privacyLink: "", checkbox: "" },
	},
	social: { linkedin: "", twitter: "" },
};

describe("LazyContact", () => {
	beforeEach(() => {
		mockInView = false;
	});

	it("renders a contact section", () => {
		render(<LazyContact dictionary={mockDictionary} lang="en" />);
		expect(document.getElementById("contact")).toBeInTheDocument();
	});

	it("does not render content when not in view", () => {
		mockInView = false;
		render(<LazyContact dictionary={mockDictionary} lang="en" />);
		expect(screen.queryByText("Contact")).not.toBeInTheDocument();
	});

	it("renders title and form wrapper when in view", () => {
		mockInView = true;
		render(<LazyContact dictionary={mockDictionary} lang="en" />);
		expect(screen.getByText("Contact")).toBeInTheDocument();
		expect(
			document.querySelector(".contact__form-wrapper")
		).toBeInTheDocument();
	});

	it("renders title as h2 with correct id", () => {
		mockInView = true;
		render(<LazyContact dictionary={mockDictionary} lang="en" />);
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveAttribute("id", "contactTitle");
		expect(heading).toHaveTextContent("Contact");
	});
});
