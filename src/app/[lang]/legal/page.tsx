/** @format */

// import LegalClient from "./LegalClient";
// import { getDictionary } from "../dictionaries";

// export default async function Legal({ params }: { params: { lang: string } }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <LegalClient initialDictionary={dictionary} />;
// }

import LegalClient from "./LegalClient";
import { getDictionary } from "../dictionaries";

export default async function Legal(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ params }: any
) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <LegalClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
