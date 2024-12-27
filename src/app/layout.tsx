/** @format */
import type { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
	title: "Simon LM | Web Accessibility Specialist",
	description: "Accessible and SEO-friendly Next.js project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body>{children}</body>
		</html>
	);
}
