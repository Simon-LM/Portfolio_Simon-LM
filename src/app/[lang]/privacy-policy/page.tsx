/** @format */

import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { getDictionary } from "../dictionaries";

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
