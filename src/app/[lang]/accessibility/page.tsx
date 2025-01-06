/** @format */

// import AccessibilityClient from "./AccessibilityClient";
// import { getDictionary } from "../dictionaries";

// export default async function Accessibility({
// 	params,
// }: {
// 	params: { lang: string };
// }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <AccessibilityClient initialDictionary={dictionary} />;
// }
import AccessibilityClient from "./AccessibilityClient";
import { getDictionary } from "../dictionaries";

export default async function Accessibility(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ params }: any
) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <AccessibilityClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
