/** @format */

import { getDictionary } from "../../dictionaries";
import ContactClient from "./ContactClient";

export default async function Contact({
	params,
}: {
	params: { lang: string };
}) {
	const dictionary = await getDictionary(params.lang as "en" | "fr");
	return <ContactClient dictionary={dictionary.sections.contact} />;
}
