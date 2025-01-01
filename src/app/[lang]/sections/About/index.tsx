/** @format */

import { getDictionary } from "../../dictionaries";
import AboutClient from "./AboutClient";

export default async function About({ params }: { params: { lang: string } }) {
	const dict = await getDictionary(params.lang as "en" | "fr");
	return <AboutClient dictionary={dict.sections.about} />;
}
