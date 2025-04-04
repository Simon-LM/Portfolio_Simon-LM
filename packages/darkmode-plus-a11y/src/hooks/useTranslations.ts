/** @format */

import { useState, useEffect } from "react";
import { translations } from "../translations";

// Type pour les traductions personnalisées
export type CustomTranslations = Partial<typeof translations.en>;

/**
 * Hook pour gérer les traductions avec support pour personnalisation
 * @param language - Code de langue spécifié (fr/en)
 * @param customTranslations - Traductions personnalisées qui surchargeront les traductions par défaut
 * @returns Objet de traductions fusionné
 */
export const useTranslations = (
	language?: string,
	customTranslations?: CustomTranslations
) => {
	// État pour stocker la langue détectée côté client
	const [detectedLang, setDetectedLang] = useState("en");

	// Effet pour détecter la langue du navigateur côté client
	useEffect(() => {
		if (typeof window !== "undefined" && typeof navigator !== "undefined") {
			// Extraire "fr" de "fr-FR" par exemple
			const browserLang = (navigator.language || "en").substring(0, 2);
			// Vérifier si la langue du navigateur est supportée
			const supportedLang = ["fr", "es"].includes(browserLang)
				? browserLang
				: "en";
			setDetectedLang(supportedLang);
		}
	}, []);

	// Priorité: 1. Langue explicite, 2. Langue détectée, 3. Anglais par défaut
	const lang = language || detectedLang;

	// Récupérer les traductions par défaut pour la langue choisie
	const defaultTranslations =
		translations[lang as keyof typeof translations] || translations["en"];

	// Fusionner avec les traductions personnalisées si spécifiées
	const mergedTranslations = customTranslations
		? deepMerge(defaultTranslations, customTranslations)
		: defaultTranslations;

	return mergedTranslations;
};

/**
 * Fonction utilitaire pour fusionner deux objets de manière profonde
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
	const output = { ...target };

	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			const sourceKey = key as keyof typeof source;
			const targetKey = key as keyof typeof target;

			if (isObject(source[sourceKey]) && key in target) {
				// @ts-ignore - Récursion pour les objets imbriqués
				output[targetKey] = deepMerge(target[targetKey], source[sourceKey]);
			} else {
				// @ts-ignore - Copie directe pour les valeurs simples
				output[targetKey] = source[sourceKey];
			}
		});
	}

	return output;
}
/**
 * Vérifie si une valeur est un objet
 */
function isObject(item: any): boolean {
	return item && typeof item === "object" && !Array.isArray(item);
}
