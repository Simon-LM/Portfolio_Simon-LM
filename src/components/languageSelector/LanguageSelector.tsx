/** @format */

"use client";

import { useLanguageStore } from "../../store/langueStore";
import { useRouter } from "next/navigation";

interface LanguageSelectorProps {
	onKeyDown?: (event: React.KeyboardEvent) => void;
}

export default function LanguageSelector({ onKeyDown }: LanguageSelectorProps) {
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
				// data-lang-selector
				onClick={() => switchLanguage("fr")}
				className="language-selector__button"
				role="menuitem"
				disabled={language === "fr"}
				onKeyDown={onKeyDown}
				aria-label="Passer au français">
				Français
			</button>
			<button
				// data-lang-selector
				onClick={() => switchLanguage("en")}
				className="language-selector__button"
				role="menuitem"
				disabled={language === "en"}
				onKeyDown={onKeyDown}
				aria-label="Switch to English">
				English
			</button>
		</div>
	);
}
