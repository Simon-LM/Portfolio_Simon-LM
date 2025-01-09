/** @format */
// import { getDictionary } from "../../dictionaries";
// import PortfolioClient from "./PortfolioClient";

// export default async function Portfolio({
// 	params,
// }: {
// 	params: { lang: string };
// }) {
// 	const dictionary = await getDictionary(params.lang as "en" | "fr");
// 	return <PortfolioClient dictionary={dictionary.sections.portfolio} />;
// }

import { getDictionary } from "../../dictionaries";
import PortfolioClient from "./PortfolioClient";

export default async function Portfolio({
	params,
}: {
	params: { lang: string };
}) {
	const dict = await getDictionary(params.lang as "en" | "fr");
	return <PortfolioClient dictionary={dict.sections.portfolio} />;
}
