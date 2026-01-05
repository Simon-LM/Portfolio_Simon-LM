/** @format */

import { getDictionary } from "../../dictionaries";
import HeroClient from "./HeroClient";

export default async function Hero({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const dict = await getDictionary(lang as "en" | "fr");
	return <HeroClient dictionary={dict.sections.hero} />;
}
