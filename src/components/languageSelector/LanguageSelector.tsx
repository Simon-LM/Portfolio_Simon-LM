/** @format */

"use client";

import { useLanguageStore } from "../../store/langueStore";
import { useRouter } from "next/navigation";

export default function LanguageSelector() {
	const { language, setLanguage } = useLanguageStore();
	const router = useRouter();

	const switchLanguage = (newLang: "fr" | "en") => {
		setLanguage(newLang);
		const currentPath = window.location.pathname.split("/").slice(2).join("/");
		router.push(`/${newLang}/${currentPath}`);
	};

	return (
		<div
			className="language-selector"
			role="group"
			aria-label="Sélecteur de langue">
			<button
				onClick={() => switchLanguage("fr")}
				className="language-selector__button"
				aria-pressed={language === "fr"}
				disabled={language === "fr"}
				aria-label="Passer au français">
				Français
			</button>
			<button
				onClick={() => switchLanguage("en")}
				className="language-selector__button"
				aria-pressed={language === "en"}
				disabled={language === "en"}
				aria-label="Switch to English">
				English
			</button>
		</div>
	);
}
