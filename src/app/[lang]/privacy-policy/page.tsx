/** @format */

import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { getDictionary } from "../dictionaries";

// export default async function PrivacyPolicy({
// 	params,
// }: {
// 	params: { lang: string };
// }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <PrivacyPolicyClient initialDictionary={dictionary} />;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function PrivacyPolicy({ params }: any) {
	// Ne pas faire “await params” ici
	const { lang } = params;
	const dictionary = await getDictionary(lang);
	return <PrivacyPolicyClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
