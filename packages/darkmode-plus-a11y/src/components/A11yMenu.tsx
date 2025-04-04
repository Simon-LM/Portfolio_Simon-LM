/** @format */
import { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useFontSize } from "../hooks/useFontSize";
import { useDyslexicFont } from "../hooks/useDyslexicFont";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useTranslations, CustomTranslations } from "../hooks/useTranslations";

interface A11yMenuProps {
	language: "fr" | "en" | "es";
	customTranslations?: CustomTranslations;
}

export const A11yMenu = ({ language, customTranslations }: A11yMenuProps) => {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } =
		useFontSize();
	const { fontType, setFontType } = useDyslexicFont();
	const { reduceMotion, toggleReduceMotion } = useReduceMotion();
	const t = useTranslations(language, customTranslations);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="dmpa-menu skeleton"></div>;
	}

	return (
		<div className="dmpa-menu" tabIndex={-1} aria-label={t.menu.aria.label}>
			<h2 className="dmpa-menu__main-title">{t.menu.title}</h2>

			{/* Catégorie Mode */}
			<div className="dmpa-menu__category">
				<h3 className="dmpa-menu__category-title">{t.categories.mode}</h3>
				<div className="dmpa-menu__buttons-row">
					<button
						className={`dmpa-menu__button ${theme === "light" ? "active" : ""}`}
						onClick={() => setTheme("light")}>
						{t.themes.light}
					</button>
					<button
						className={`dmpa-menu__button ${theme === "dark" ? "active" : ""}`}
						onClick={() => setTheme("dark")}>
						{t.themes.dark}
					</button>
					<button
						className={`dmpa-menu__button ${
							theme === "high-contrast" ? "active" : ""
						}`}
						onClick={() => setTheme("high-contrast")}>
						{t.themes.highContrast}
					</button>
				</div>
			</div>

			{/* Catégorie Taille de texte */}
			<div className="dmpa-menu__category">
				<h3 className="dmpa-menu__category-title">{t.fontSize.label}</h3>
				<div className="dmpa-menu__buttons-row">
					<button
						className="dmpa-menu__button dmpa-menu__button--icon"
						onClick={decreaseFontSize}
						aria-label={t.fontSize.decrease}>
						A-
					</button>
					<button
						className="dmpa-menu__button dmpa-menu__button--icon"
						onClick={resetFontSize}>
						{t.fontSize.reset}
					</button>
					<button
						className="dmpa-menu__button dmpa-menu__button--icon"
						onClick={increaseFontSize}
						aria-label={t.fontSize.increase}>
						A+
					</button>
				</div>
			</div>

			{/* Police dyslexique */}
			<div className="dmpa-menu__category">
				<h3 className="dmpa-menu__category-title">{t.dyslexic.label}</h3>
				<div className="dmpa-menu__buttons-row">
					<select
						className="dmpa-menu__select"
						value={fontType}
						onChange={(e) => setFontType(e.target.value as any)}
						aria-label={t.dyslexic.label}>
						<option value="none">{t.dyslexic.none}</option>
						<option value="opendyslexic">{t.dyslexic.openDyslexic}</option>
						<option value="atkinson">{t.dyslexic.atkinson}</option>
						<option value="sylexiad">{t.dyslexic.sylexiad}</option>
						<option value="sylexiad-serif">{t.dyslexic.sylexiadSerif}</option>
						<option value="andika">{t.dyslexic.andika}</option>
					</select>
				</div>
			</div>

			{/* Réduire les animations */}
			<div className="dmpa-menu__category">
				<div className="dmpa-menu__toggle-row">
					<label className="dmpa-menu__toggle-label">
						{t.visualHelps.reduceMotion.name}
						<button
							className={`dmpa-menu__toggle ${reduceMotion ? "active" : ""}`}
							onClick={toggleReduceMotion}
							aria-pressed={reduceMotion}>
							<span className="dmpa-menu__toggle-track">
								<span className="dmpa-menu__toggle-thumb"></span>
							</span>
							<span className="dmpa-menu__toggle-text">
								{reduceMotion ? t.dyslexic.active : t.dyslexic.inactive}
							</span>
						</button>
					</label>
					<p className="dmpa-menu__description">
						{t.visualHelps.reduceMotion.description}
					</p>
				</div>
			</div>
		</div>
	);
};
