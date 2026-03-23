/** @format */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContactForm } from "./ContactForm";

// Mock FormFields to isolate ContactForm testing
jest.mock("./FormFields", () => ({
	FormFields: () => <div data-testid="form-fields" />,
}));

const mockDictionary = {
	title: "Contact",
	subtitle: "Get in touch",
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

const defaultProps = {
	onSubmit: jest.fn((e) => e.preventDefault()),
	register: jest.fn(() => ({})) as ReturnType<
		typeof jest.fn
	> as unknown as Parameters<typeof ContactForm>[0]["register"],
	errors: {},
	dictionary: mockDictionary,
	isLoading: false,
	lang: "en",
};

describe("ContactForm", () => {
	it("renders submit button with correct text", () => {
		render(<ContactForm {...defaultProps} />);
		expect(
			screen.getByRole("button", { name: "Send" })
		).toBeInTheDocument();
	});

	it("shows sending text when loading", () => {
		render(<ContactForm {...defaultProps} isLoading={true} />);
		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Sending...");
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");
	});

	it("submit button is enabled when not loading", () => {
		render(<ContactForm {...defaultProps} />);
		const button = screen.getByRole("button", { name: "Send" });
		expect(button).not.toBeDisabled();
	});

	it("renders FormFields component", () => {
		render(<ContactForm {...defaultProps} />);
		expect(screen.getByTestId("form-fields")).toBeInTheDocument();
	});
});
