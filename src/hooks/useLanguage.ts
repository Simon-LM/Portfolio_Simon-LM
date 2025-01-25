/** @format */

"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * Custom hook to manage current language and language switching
 */
export function useLanguage() {
	const router = useRouter();
	const pathname = usePathname();

	// Extract the current language from the URL path
	const currentLang = pathname.split("/")[1] || "fr";

	/**
	 * Function to change language
	 * @param newLang - New language to select ('en' or 'fr')
	 */
	const switchLanguage = (newLang: "fr" | "en") => {
		const newPath = pathname.replace(/^\/[^\/]+/, `/${newLang}`);
		router.push(newPath);
	};

	return { currentLang, switchLanguage };
}
