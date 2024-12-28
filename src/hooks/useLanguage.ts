/** @format */

"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * Hook personnalisé pour gérer la langue actuelle et changer de langue
 */
export function useLanguage() {
	const router = useRouter();
	const pathname = usePathname();

	// Extract the current language from the URL path
	const currentLang = pathname.split("/")[1] || "fr";

	/**
	 * Fonction pour changer de langue
	 * @param newLang - Nouvelle langue à sélectionner ('en' ou 'fr')
	 */
	const switchLanguage = (newLang: "fr" | "en") => {
		const newPath = pathname.replace(/^\/[^\/]+/, `/${newLang}`);
		router.push(newPath);
	};

	return { currentLang, switchLanguage };
}
