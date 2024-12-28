/** @format */

import { getDictionary } from "../../dictionaries";
import SkillsClient from "./Skills";

export default async function Skills({ params }: { params: { lang: string } }) {
	const dict = await getDictionary(params.lang as "en" | "fr");
	return <SkillsClient dictionary={dict.sections.skills} />;
}
