/** @format */

import { Metadata } from "next";
import Script from "next/script";
import { LanguageSync } from "../../components/LanguageSync";
import { THEMES } from "@/config/themes";
import { themeInitScript } from "a11y-prefs/react/themeInitScript";

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
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const langKey = lang as keyof typeof metadata;

	// Retourner les métadonnées complètes, pas seulement title et description
	return {
		// Métadonnées spécifiques à la langue
		title: metadata[langKey].title,
		description: metadata[langKey].description,

		// Préserver les métadonnées importantes du layout parent
		metadataBase: new URL("https://www.simon-lm.dev"),
		icons: {
			icon: "/favicon.ico",
			shortcut: "/favicon.ico",
			apple: [
				{ url: "/Logo_LostInTab/apple-touch-icon.png", sizes: "180x180" },
			],
		},
		appleWebApp: {
			capable: true,
			statusBarStyle: "default",
			title: "Simon LM",
		},

		alternates: {
			canonical: `/${lang}`,
			languages: {
				fr: "/fr",
				en: "/en",
			},
		},
	};
}

export async function generateStaticParams() {
	return [{ lang: "en" }, { lang: "fr" }];
}

export default async function LangLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;

	return (
		<>
			{/* Sync Zustand language store with URL lang to prevent hydration mismatch */}
			<LanguageSync lang={lang as "fr" | "en"} />

			{/* Script anti-FOUC : chaîne générée par le paquet (E4 phase 3),
			    byte-identique au littéral historique — oracle vérifié. */}
			<Script
				id="theme-script"
				strategy="beforeInteractive"
				dangerouslySetInnerHTML={{
					__html: themeInitScript(THEMES),
				}}
			/>

			{/* Mettre à jour dynamiquement l'attribut lang */}
			<Script
				id="update-lang"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
				document.documentElement.lang = "${lang}";
			  `,
				}}
			/>

			<Script
				id="preload-image"
				strategy="beforeInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            const link = document.createElement('link');
            link.rel = "preload";
            link.as = "image";
            link.href = "/icons/Icon_Accessibility_Contrasts-Visuals/Icon_Accessibility_Contrasts-Visuals.avif";
            link.type = "image/avif";
            document.head.appendChild(link);
          `,
				}}
			/>

			{children}
		</>
	);
}
