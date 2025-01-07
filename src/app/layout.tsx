/** @format */

// export default function RootLayout({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	return children;
// }

// // // // // // // // // // // // // // // // // // // // //

// import { Metadata } from "next";

// export const metadata: Metadata = {
// 	metadataBase: new URL("https://www.simon-lm.dev"),
// 	title: {
// 		template: "%s | Simon LM",
// 		default: "Simon LM | Web Accessibility Specialist",
// 	},
// 	description: "Frontend developer specialized in web accessibility...",
// 	themeColor: "#284b63",
// 	appleWebApp: {
// 		capable: true,
// 		statusBarStyle: "default",
// 		title: "Simon LM",
// 	},
// 	icons: {
// 		icon: "/favicon.ico",
// 		shortcut: "/favicon.ico",
// 		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
// 	},
// 	alternates: {
// 		canonical: "https://www.simon-lm.dev",
// 	},
// };

// export default function RootLayout({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	return (
// 		<html>
// 			<head>
// 				<link rel="canonical" href="https://www.simon-lm.dev" />
// 				<link
// 					rel="apple-touch-icon"
// 					sizes="180x180"
// 					href="/apple-touch-icon.png"
// 				/>
// 				<meta name="theme-color" content="#284b63" />
// 			</head>
// 			<body>{children}</body>
// 		</html>
// 	);
// }

// // // // // // // // // // // // // // // // // // // // // //

// import { Metadata } from "next";

// export const metadata: Metadata = {
// 	metadataBase: new URL("https://www.simon-lm.dev"),
// 	themeColor: "#284b63",
// 	appleWebApp: {
// 		capable: true,
// 		statusBarStyle: "default",
// 		title: "Simon LM",
// 	},
// 	icons: {
// 		icon: "/favicon.ico",
// 		shortcut: "/favicon.ico",
// 		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
// 	},
// 	alternates: {
// 		canonical: "https://www.simon-lm.dev",
// 	},
// };

// export default function RootLayout({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	return (
// 		<html suppressHydrationWarning>
// 			<head>
// 				<link rel="canonical" href="https://www.simon-lm.dev" />
// 				<link
// 					rel="apple-touch-icon"
// 					sizes="180x180"
// 					href="/apple-touch-icon.png"
// 				/>
// 				<meta name="theme-color" content="#284b63" />
// 			</head>
// 			<body>{children}</body>
// 		</html>
// 	);
// }

// // // // // // // // // // //

// import { Metadata } from "next";

// export const metadata: Metadata = {
// 	title: "Simon LM",
// 	description:
// 		"Portfolio de Simon LM - Développeur Frontend spécialisé en accessibilité web",
// 	appleWebApp: {
// 		capable: true,
// 		statusBarStyle: "default",
// 		title: "Simon LM",
// 	},
// 	icons: {
// 		icon: "/favicon.ico",
// 		shortcut: "/favicon.ico",
// 		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
// 	},
// };

// export default function RootLayout({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	return (
// 		<html suppressHydrationWarning>
// 			<body>{children}</body>
// 		</html>
// 	);
// }

// // // // // // // // // // // // // // // // // // //

import { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
	metadataBase: new URL("https://simon-lm.vercel.app"),
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
