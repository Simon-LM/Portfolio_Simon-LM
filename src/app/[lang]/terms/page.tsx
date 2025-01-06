/** @format */

// import TermsClient from "./TermsClient";
// import { getDictionary } from "../dictionaries";

// export default async function Terms({ params }: { params: { lang: string } }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <TermsClient initialDictionary={dictionary} />;
// }

import TermsClient from "./TermsClient";
import { getDictionary } from "../dictionaries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Terms({ params }: any) {
	const { lang } = params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <TermsClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
