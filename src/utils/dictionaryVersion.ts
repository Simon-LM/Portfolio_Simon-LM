/** @format */

export const DICTIONARY_VERSION = "1.0.5"; // Mettre à jour cette version quand les dictionnaires changent

export const shouldUpdateDictionary = (storedVersion: string): boolean => {
	return storedVersion !== DICTIONARY_VERSION;
};
