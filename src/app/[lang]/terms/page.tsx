/** @format */

// import TermsClient from "./TermsClient";
// import { getDictionary } from "../dictionaries";

// export default async function Terms({ params }: { params: { lang: string } }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <TermsClient initialDictionary={dictionary} />;
// }

import TermsClient from "./TermsClient";
import { getDictionary } from "../dictionaries";

export default async function Terms({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <TermsClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
