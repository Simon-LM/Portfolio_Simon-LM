/** @format */

// Comment in English: Import global styles
import "../../styles/main.scss";

/**
 * Comment in English: Generates static parameters for supported locales
 */
export async function generateStaticParams() {
	return [{ lang: "en" }, { lang: "fr" }];
}

/**
 * Comment in English: Generates metadata to set the html lang attribute
 */
export async function generateMetadata({
	params,
}: {
	params: { lang: string };
}) {
	return {
		htmlLang: params.lang,
	};
}

export default function LangLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { lang: string };
}) {
	return <>{children}</>;
}
