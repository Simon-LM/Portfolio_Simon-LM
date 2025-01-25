/** @format */

export const DICTIONARY_VERSION = "1.0.6"; // Update this version when dictionaries change

export const shouldUpdateDictionary = (storedVersion: string): boolean => {
	return storedVersion !== DICTIONARY_VERSION;
};
