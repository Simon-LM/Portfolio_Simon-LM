/** @format */
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import HeroClient from "./HeroClient";
import "@testing-library/jest-dom";

interface MockCollapseProps {
	title: string;
	children: React.ReactNode;
	id?: string;
	headingLevel?: "h2" | "h3" | "h4";
}

// Mock du composant Collapse
jest.mock("../../../../components/collapse/Collapse", () => {
	return function MockCollapse({ title, children, id }: MockCollapseProps) {
		return (
			<div>
				<button onClick={() => {}}>{title}</button>
				<div id={id}>{children}</div>
			</div>
		);
	};
});

// Mock de framer-motion
jest.mock("framer-motion", () => ({
	motion: {
		section: jest.fn(({ children, ...props }) => (
			<section {...props}>{children}</section>
		)),
		div: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
		h1: jest.fn(({ children, ...props }) => <h1 {...props}>{children}</h1>),
	},
}));

const mockDictionary = {
	title: "Test Title",
	subtitle: "Test Subtitle",
	features: [
		{
			title: "Feature 1",
			description: "Description 1",
		},
		{
			title: "Feature 2",
			description: "Description 2",
		},
	],
};

describe("HeroClient", () => {
	it("renders without crashing", () => {
		render(<HeroClient dictionary={mockDictionary} />);
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
	});

	it("displays feature content", () => {
		render(<HeroClient dictionary={mockDictionary} />);
		expect(screen.getByText("Feature 1")).toBeInTheDocument();
		expect(screen.getByText("Description 1")).toBeInTheDocument();
	});
});
