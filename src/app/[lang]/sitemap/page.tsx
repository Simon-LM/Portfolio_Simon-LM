/** @format */

// import { getDictionary } from "../dictionaries";
// import SiteMapClient from "./SiteMapClient";

// export default async function SiteMap({
// 	params,
// }: {
// 	params: { lang: string };
// }) {
// 	const dict = await getDictionary(params.lang as "fr" | "en");
// 	return <SiteMapClient initialDictionary={dict} />;
// }

import { getDictionary } from "../dictionaries";
import SiteMapClient from "./SiteMapClient";

export default async function SiteMap(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ params }: any
) {
	const { lang } = await params;
	const dictionary = await getDictionary(lang as "en" | "fr");
	return <SiteMapClient initialDictionary={dictionary} />;
}

export async function generateStaticParams() {
	return [{ lang: "fr" }, { lang: "en" }];
}
