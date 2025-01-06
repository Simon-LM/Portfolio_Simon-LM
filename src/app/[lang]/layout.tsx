/** @format */

// import "../../styles/main.scss";

// const metadata = {
// 	fr: {
// 		title: "Simon LM | Spécialiste en Accessibilité Web",
// 		description:
// 			"Portfolio de Simon LM, développeur frontend spécialisé en accessibilité web. Expert en React, Next.js et standards WCAG.",
// 	},
// 	en: {
// 		title: "Simon LM | Web Accessibility Specialist",
// 		description:
// 			"Simon LM's portfolio - Frontend developer specialized in web accessibility. Expert in React, Next.js and WCAG standards.",
// 	},
// };

// export async function generateMetadata({
// 	params,
// }: {
// 	params: { lang: string };
// }) {
// 	const lang = params.lang as keyof typeof metadata;
// 	return {
// 		title: metadata[lang].title,
// 		description: metadata[lang].description,
// 		themeColor: "#284b63",
// 		metadataBase: new URL("https://www.simon-lm.dev"),
// 		viewport: "width=device-width, initial-scale=1",
// 		appleWebApp: {
// 			capable: true,
// 			statusBarStyle: "default",
// 			title: metadata[lang].title,
// 		},
// 		icons: {
// 			apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
// 		},
// 	};
// }

// export default function LangLayout({
// 	children,
// 	params,
// }: {
// 	children: React.ReactNode;
// 	params: { lang: string };
// }) {
// 	const lang = params.lang as keyof typeof metadata;
// 	const canonicalUrl = "https://www.simon-lm.dev";

// 	return (
// 		<html lang={lang}>
// 			<head>
// 				<title>{metadata[lang].title}</title>
// 				<meta charSet="utf-8" />
// 				<meta name="viewport" content="width=device-width, initial-scale=1" />
// 				<meta name="description" content={metadata[lang].description} />
// 				<meta name="theme-color" content="#284b63" />
// 				<link rel="canonical" href={canonicalUrl} />
// 				<link
// 					rel="apple-touch-icon"
// 					href="/apple-touch-icon.png"
// 					sizes="180x180"
// 				/>
// 				{/* Préchargement des ressources critiques */}
// 				<link
// 					rel="preload"
// 					href="/fonts/your-main-font.woff2"
// 					as="font"
// 					type="font/woff2"
// 					crossOrigin="anonymous"
// 					fetchPriority="high"
// 				/>
// 			</head>
// 			<body>{children}</body>
// 		</html>
// 	);
// }

// export async function generateStaticParams() {
// 	return [{ lang: "en" }, { lang: "fr" }];
// }

// // // // // // // // // // // // // // // // // //

// import { Metadata } from "next";
// import "../../styles/main.scss";

// const metadata = {
// 	fr: {
// 		title: "Simon LM | Spécialiste en Accessibilité Web",
// 		description:
// 			"Portfolio de Simon LM, développeur frontend spécialisé en accessibilité web...",
// 	},
// 	en: {
// 		title: "Simon LM | Web Accessibility Specialist",
// 		description:
// 			"Simon LM's portfolio - Frontend developer specialized in web accessibility...",
// 	},
// };

// export async function generateMetadata({
// 	params,
// }: {
// 	params: { lang: string };
// }): Promise<Metadata> {
// 	const lang = params.lang as keyof typeof metadata;
// 	return {
// 		title: metadata[lang].title,
// 		description: metadata[lang].description,
// 	};
// }

// export default function RootLayout({
// 	children,
// 	params: { lang },
// }: {
// 	children: React.ReactNode;
// 	params: { lang: "fr" | "en" };
// }) {
// 	return (
// 		<html lang={lang}>
// 			<body>{children}</body>
// 		</html>
// 	);
// }

// // // // // // // // // // // // // // // // // // // // // //

import { Metadata } from "next";
import "../../styles/main.scss";

const metadata = {
	fr: {
		title: "Simon LM | Spécialiste en Accessibilité Web",
		description:
			"Portfolio de Simon LM, développeur frontend spécialisé en accessibilité web...",
	},
	en: {
		title: "Simon LM | Web Accessibility Specialist",
		description:
			"Simon LM's portfolio - Frontend developer specialized in web accessibility...",
	},
};

export async function generateMetadata({
	params,
}: {
	params: { lang: string };
}): Promise<Metadata> {
	const lang = params.lang as keyof typeof metadata;
	return {
		title: metadata[lang].title,
		description: metadata[lang].description,
	};
}

export async function generateStaticParams() {
	return [{ lang: "en" }, { lang: "fr" }];
}

export default function LangLayout({
	children,
	params: { lang },
}: {
	children: React.ReactNode;
	params: { lang: "fr" | "en" };
}) {
	return (
		<html lang={lang} suppressHydrationWarning>
			<body>{children}</body>
		</html>
	);
}
