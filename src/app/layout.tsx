/** @format */

import { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
	metadataBase: new URL("https://www.simon-lm.dev"),
	title: {
		template: "%s | Simon LM",
		default: "Simon LM | Développeur Frontend Accessibilité",
	},
	description:
		"Portfolio de Simon LM - Développeur Frontend spécialisé en accessibilité web",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Simon LM",
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
	themeColor: "#284b63",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html suppressHydrationWarning>
			<body>{children}</body>
		</html>
	);
}
