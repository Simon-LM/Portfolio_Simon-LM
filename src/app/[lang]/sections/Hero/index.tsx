/** @format */

import { getDictionary } from "../../dictionaries";
import HeroClient from "./HeroClient";

export default async function Hero({ params }: { params: { lang: string } }) {
	const dict = await getDictionary(params.lang as "en" | "fr");
	return <HeroClient dictionary={dict.sections.hero} />;
}
