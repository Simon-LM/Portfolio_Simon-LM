/** @format */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ErrorToast } from "./ErrorToast";

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
		success: "Message sent!",
		error: "An error occurred while sending the message.",
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
	social: {
		linkedin: "https://linkedin.com/in/test-user",
		twitter: "https://twitter.com/test",
	},
};

describe("ErrorToast", () => {
	it("renders error message", () => {
		render(<ErrorToast dictionary={mockDictionary} />);
		expect(
			screen.getByText("An error occurred while sending the message.")
		).toBeInTheDocument();
	});

	it("renders with alert role for accessibility", () => {
		render(<ErrorToast dictionary={mockDictionary} />);
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("displays LinkedIn link", () => {
		render(<ErrorToast dictionary={mockDictionary} />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute(
			"href",
			"https://linkedin.com/in/test-user"
		);
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});
});
