/** @format */

import "server-only";
import { DICTIONARY_VERSION } from "../../utils/dictionaryVersion";

export async function getDictionary(locale: "en" | "fr") {
	const dictionary = await import(`./dictionaries/${locale}.json`);
	return {
		...dictionary.default,
		_version: DICTIONARY_VERSION,
	};
}
