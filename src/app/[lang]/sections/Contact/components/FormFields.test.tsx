/** @format */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as Form from "@radix-ui/react-form";
import { FormFields } from "./FormFields";

// Mock next/link
jest.mock("next/link", () => {
	return function MockLink({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
		[key: string]: unknown;
	}) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	};
});

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
		emailFormat: "Expected format: example@domain.com",
		phoneFormat: {
			line1: "Expected format: 06 12 34 56 78",
			line2: "or +33 6 12 34 56 78",
		},
		subject: "Subject",
		message: "Message",
		submit: "Send",
		sending: "Sending...",
		success: "Sent!",
		error: "Error",
		errors: {
			firstName: "First name required",
			lastName: "Last name required",
			email: "Invalid email",
			subject: "Subject required",
			message: "Message too short",
			gdpr: "GDPR required",
		},
		gdpr: {
			text: "Your data will be processed.",
			privacyLink: "Privacy policy",
			checkbox: "I agree to data processing",
		},
	},
	social: { linkedin: "", twitter: "" },
};

// Create a mock register function that returns proper input props
const mockRegister = jest.fn((name: string) => ({
	name,
	onChange: jest.fn(),
	onBlur: jest.fn(),
	ref: jest.fn(),
}));

const defaultProps = {
	register: mockRegister as unknown as Parameters<
		typeof FormFields
	>[0]["register"],
	errors: {},
	dictionary: mockDictionary,
	lang: "en",
};

function renderFormFields(props = defaultProps) {
	return render(
		<Form.Root>
			<FormFields {...props} />
		</Form.Root>
	);
}

describe("FormFields", () => {
	it("renders all form fields", () => {
		renderFormFields();

		expect(screen.getByLabelText("First Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Subject")).toBeInTheDocument();
		expect(screen.getByLabelText("Message")).toBeInTheDocument();
	});

	it("renders optional fields with optional label", () => {
		renderFormFields();

		const optionalLabels = screen.getAllByText("optional");
		expect(optionalLabels).toHaveLength(2); // Company and Phone
	});

	it("renders honeypot field hidden from users", () => {
		renderFormFields();

		const honeypot = screen.getByLabelText("Ne pas remplir");
		expect(honeypot).toBeInTheDocument();
		expect(honeypot).toHaveAttribute("tabindex", "-1");
		expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
		expect(honeypot.closest('[aria-hidden="true"]')).toHaveClass("sr-only");
	});

	it("renders GDPR consent checkbox and privacy link", () => {
		renderFormFields();

		expect(
			screen.getByLabelText("I agree to data processing")
		).toBeInTheDocument();
		expect(screen.getByText("Your data will be processed.")).toBeInTheDocument();

		const privacyLink = screen.getByText("Privacy policy");
		expect(privacyLink).toHaveAttribute("href", "/en/privacy-policy");
	});

	it("shows validation errors when provided", () => {
		const errors = {
			firstName: { message: "First name required", type: "required" },
			email: { message: "Invalid email", type: "validate" },
		};

		renderFormFields({ ...defaultProps, errors });

		expect(screen.getByText("First name required")).toBeInTheDocument();
		expect(screen.getByText("Invalid email")).toBeInTheDocument();
	});

	it("sets aria-invalid on fields with errors", () => {
		const errors = {
			firstName: { message: "Required", type: "required" },
		};

		renderFormFields({ ...defaultProps, errors });

		expect(screen.getByLabelText("First Name")).toHaveAttribute(
			"aria-invalid",
			"true"
		);
		expect(screen.getByLabelText("Last Name")).toHaveAttribute(
			"aria-invalid",
			"false"
		);
	});

	it("marks required fields with data-required attribute", () => {
		renderFormFields();

		expect(screen.getByLabelText("First Name")).toHaveAttribute(
			"data-required",
			"true"
		);
		expect(screen.getByLabelText("Email")).toHaveAttribute(
			"data-required",
			"true"
		);
		expect(screen.getByLabelText("Subject")).toHaveAttribute(
			"data-required",
			"true"
		);
		expect(screen.getByLabelText("Message")).toHaveAttribute(
			"data-required",
			"true"
		);
	});

	it("renders phone format hints", () => {
		renderFormFields();

		expect(
			screen.getByText("Expected format: 06 12 34 56 78")
		).toBeInTheDocument();
		expect(
			screen.getByText("or +33 6 12 34 56 78")
		).toBeInTheDocument();
	});

	it("renders email format hint", () => {
		renderFormFields();

		expect(
			screen.getByText("Expected format: example@domain.com")
		).toBeInTheDocument();
	});

	it("uses correct privacy policy link for French locale", () => {
		renderFormFields({ ...defaultProps, lang: "fr" });

		const privacyLink = screen.getByText("Privacy policy");
		expect(privacyLink).toHaveAttribute("href", "/fr/privacy-policy");
	});
});
