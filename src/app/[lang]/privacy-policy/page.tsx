/** @format */

import PrivacyPolicyClient from "./PrivacyPolicyClient";
import { getDictionary } from "../dictionaries";

export default async function PrivacyPolicy({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <PrivacyPolicyClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
