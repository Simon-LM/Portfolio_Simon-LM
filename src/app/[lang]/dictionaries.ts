/** @format */

// //  Lazy import for translations
// import "server-only";

// const dictionaries = {
// 	en: () => import("./dictionaries/en.json").then((module) => module.default),
// 	fr: () => import("./dictionaries/fr.json").then((module) => module.default),
// };

// export const getDictionary = async (locale: "en" | "fr") =>
// 	dictionaries[locale]();

import "server-only";
import { DICTIONARY_VERSION } from "../../utils/dictionaryVersion";

export async function getDictionary(locale: "en" | "fr") {
	const dictionary = await import(`./dictionaries/${locale}.json`);
	return {
		...dictionary.default,
		_version: DICTIONARY_VERSION,
	};
}
