/** @format */

import { getDictionary } from "../dictionaries";
import SiteMapClient from "./SiteMapClient";

export default async function SiteMap({
	params,
}: {
	params: { lang: string };
}) {
	const dict = await getDictionary(params.lang as "fr" | "en");
	return <SiteMapClient initialDictionary={dict} />;
}
