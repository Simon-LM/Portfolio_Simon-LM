/** @format */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ContactClient from "./ContactClient";

// Mock generateMetadata
jest.mock("../../../../utils/metadata", () => ({
	generateMetadata: () => ({
		date: "22/03/2026",
		heure: "10:00:00",
		langue: "fr",
	}),
}));

// Mock react-hot-toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("react-hot-toast", () => ({
	Toaster: () => <div data-testid="toaster" />,
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
		success: "Message sent!",
		error: "An error occurred.",
		errors: {
			firstName: "First name required",
			lastName: "Last name required",
			email: "Invalid email",
			subject: "Subject required",
			message: "Message too short",
			gdpr: "You must accept GDPR",
		},
		gdpr: {
			text: "Your data will be processed.",
			privacyLink: "Privacy policy",
			checkbox: "I agree",
		},
	},
	social: {
		linkedin: "https://linkedin.com/in/test",
		twitter: "https://twitter.com/test",
	},
};

describe("ContactClient", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders the contact form with all fields", () => {
		render(<ContactClient dictionary={mockDictionary} lang="en" />);

		expect(screen.getByLabelText("First Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
		expect(screen.getByLabelText("Subject")).toBeInTheDocument();
		expect(screen.getByLabelText("Message")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Send" })
		).toBeInTheDocument();
	});

	it("shows validation errors for empty required fields on submit", async () => {
		const user = userEvent.setup();
		render(<ContactClient dictionary={mockDictionary} lang="en" />);

		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() => {
			expect(screen.getByText("First name required")).toBeInTheDocument();
			expect(screen.getByText("Last name required")).toBeInTheDocument();
			expect(screen.getByText("Invalid email")).toBeInTheDocument();
		});
	});

	it("submits form successfully and shows success toast", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ success: true }),
		});

		render(<ContactClient dictionary={mockDictionary} lang="fr" />);

		await user.type(screen.getByLabelText("First Name"), "Jean");
		await user.type(screen.getByLabelText("Last Name"), "Dupont");
		await user.type(screen.getByLabelText("Email"), "jean@test.com");
		await user.type(screen.getByLabelText("Subject"), "Test subject");
		await user.type(
			screen.getByLabelText("Message"),
			"A test message that is long enough"
		);
		await user.click(screen.getByLabelText("I agree"));
		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith("Message sent!");
		});

		// Verify no reCAPTCHA token in request
		const fetchCall = mockFetch.mock.calls[0];
		const body = JSON.parse(fetchCall[1].body);
		expect(body["g-recaptcha-response"]).toBeUndefined();
		expect(body.firstName).toBe("Jean");
	});

	it("shows error toast on submission failure", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValueOnce({
			ok: false,
			json: async () => ({ error: "Server error" }),
		});

		render(<ContactClient dictionary={mockDictionary} lang="fr" />);

		await user.type(screen.getByLabelText("First Name"), "Jean");
		await user.type(screen.getByLabelText("Last Name"), "Dupont");
		await user.type(screen.getByLabelText("Email"), "jean@test.com");
		await user.type(screen.getByLabelText("Subject"), "Test");
		await user.type(
			screen.getByLabelText("Message"),
			"A test message that is long enough"
		);
		await user.click(screen.getByLabelText("I agree"));
		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalledWith("An error occurred.");
		});
	});

	it("shows error toast on network error", async () => {
		const user = userEvent.setup();
		mockFetch.mockRejectedValueOnce(new Error("Network error"));

		render(<ContactClient dictionary={mockDictionary} lang="fr" />);

		await user.type(screen.getByLabelText("First Name"), "Jean");
		await user.type(screen.getByLabelText("Last Name"), "Dupont");
		await user.type(screen.getByLabelText("Email"), "jean@test.com");
		await user.type(screen.getByLabelText("Subject"), "Test");
		await user.type(
			screen.getByLabelText("Message"),
			"A test message that is long enough"
		);
		await user.click(screen.getByLabelText("I agree"));
		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() => {
			expect(mockToastError).toHaveBeenCalled();
		});
	});
});
