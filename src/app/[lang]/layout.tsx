/** @format */

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
			<head>
				<link
					rel="preload"
					as="image"
					href="/_next/static/media/Icon_Accessibility_Contrasts-Visuals.71537667.png"
				/>

				<script
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `
                            (function() {
                                try {
                                    var savedTheme = localStorage.getItem('theme');
                                    if (savedTheme && ['light', 'dark', 'high-contrast', 'deuteranopia', 'protanopia'].includes(savedTheme)) {
                                        document.documentElement.setAttribute('data-theme', savedTheme);
                                    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    } else {
                                        document.documentElement.setAttribute('data-theme', 'light');
                                    }
                                } catch (e) {}
                            })();
                        `,
					}}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
