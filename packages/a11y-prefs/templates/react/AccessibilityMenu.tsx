/** @format */

"use client";

// Carte d'accessibilité (template scaffoldé — vous la possédez, modifiez-la
// librement). Généralisée depuis le portfolio de référence : état via le
// hook `usePreference` du paquet (pas de store à installer), polices du
// paquet uniquement, aucune dépendance à un framework (pas de next/link).
//
// ⚠️ `a11y-prefs` = nom d'import du paquet ; le CLI le réécrit vers le nom
// installé (défaut « darkmode-plus-a11y ») lors de `init`.

import {
	useState,
	useEffect,
	useRef,
	useSyncExternalStore,
	type RefObject,
	type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Select, { GroupBase, StylesConfig } from "react-select";
import type { SelectInstance } from "react-select";
import { FaUniversalAccess } from "react-icons/fa";
import { useTheme, usePrefersDarkMode, type ThemeOption } from "a11y-prefs/react";
import { applyReduceMotion } from "a11y-prefs/react/appliers";
import {
	useFontSize,
	useAccessibilityFont,
} from "./accessibilityPreferences";

// false au serveur, true après hydratation — sans enfreindre
// react-hooks/set-state-in-effect.
function useIsMounted(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

type Props = {
	language: string;
	onClose?: () => void;
	/** Lien vers votre déclaration d'accessibilité (optionnel). */
	complianceUrl?: string;
};

// Variantes du mode fort contraste — « high-contrast » = jaune sur noir.
type HcVariant =
	| "high-contrast"
	| "high-contrast-green"
	| "high-contrast-white"
	| "high-contrast-paper";

// Modificateur SCSS de chaque bouton de variante (couleurs réelles dans le
// SCSS, patron __hc-variant-button).
const HC_VARIANT_MODIFIERS: Record<HcVariant, string> = {
	"high-contrast": "yellow",
	"high-contrast-green": "green",
	"high-contrast-white": "white",
	"high-contrast-paper": "paper",
};

type OptionType = { value: string; label: string };
type FontType = "none" | "opendyslexic" | "atkinson" | "andika";

export default function AccessibilityMenu({
	language,
	onClose,
	complianceUrl,
}: Props) {
	const mounted = useIsMounted();
	const { theme, setTheme } = useTheme();
	const [fontSize, setFontSize] = useFontSize();
	const [fontType, setFontType] = useAccessibilityFont();
	const [isDyslexicMode, setIsDyslexicMode] = useState(false);
	// reduceMotion : init paresseuse (localStorage / prefers-reduced-motion)
	const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		const saved = localStorage.getItem("reduce-motion");
		if (saved !== null) return saved === "true";
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	const prefersDarkMode = usePrefersDarkMode();
	const lastBaseTheme = useRef<"light" | "dark">(
		prefersDarkMode ? "dark" : "light",
	);
	const colorVisionSelectRef = useRef<SelectInstance<OptionType> | null>(null);
	const fontTypeSelectRef = useRef<SelectInstance<OptionType> | null>(null);
	// Dernière variante de fort contraste utilisée (le toggle la réactive).
	const [hcVariant, setHcVariant] = useState<HcVariant>(() => {
		if (typeof window === "undefined") return "high-contrast";
		const saved = localStorage.getItem("hc-variant");
		return saved === "high-contrast-green" ||
			saved === "high-contrast-white" ||
			saved === "high-contrast-paper"
			? saved
			: "high-contrast";
	});

	// Basculer le mode dyslexie optimisé (classe DOM dyslexia-optimized).
	const toggleDyslexicMode = () => {
		const newMode = !isDyslexicMode;
		setIsDyslexicMode(newMode);
		if (newMode) {
			document.documentElement.classList.add("dyslexia-optimized");
			if (fontType !== "none") setFontType("none");
		} else {
			document.documentElement.classList.remove("dyslexia-optimized");
		}
	};

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			document.documentElement.classList.toggle(
				"dyslexia-optimized",
				isDyslexicMode,
			);
		}
	}, [mounted, isDyslexicMode]);

	useEffect(() => {
		if (theme === "light" || theme === "dark") {
			lastBaseTheme.current = theme;
		}
	}, [theme]);

	// La classe typo du fort contraste s'applique à TOUTES les variantes.
	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			document.documentElement.classList.toggle(
				"high-contrast",
				theme.startsWith("high-contrast"),
			);
		}
	}, [mounted, theme]);

	// Mémoriser la dernière variante de fort contraste (pas d'effet : la
	// règle du projet interdit setState dans un effet).
	const selectHcVariant = (variant: HcVariant) => {
		setHcVariant(variant);
		localStorage.setItem("hc-variant", variant);
		setTheme(variant);
	};

	const activateAntiGlare = () => {
		setTheme(
			lastBaseTheme.current === "dark" ? "anti-glare-dark" : "anti-glare-light",
		);
	};

	const activateAntiGlareLight = () => setTheme("anti-glare-light");

	const getColorVisionMode = (currentTheme: string): string => {
		if (
			currentTheme === "light" ||
			currentTheme === "dark" ||
			currentTheme.startsWith("high-contrast") ||
			currentTheme === "anti-glare-light" ||
			currentTheme === "anti-glare-dark"
		) {
			return "normal";
		}
		const colorVisionTypes = [
			"protanomaly",
			"protanopia",
			"deuteranomaly",
			"deuteranopia",
			"tritanomaly",
			"tritanopia",
			"achromatopsia",
		];
		for (const type of colorVisionTypes) {
			if (currentTheme.includes(type)) return type;
		}
		return "normal";
	};

	const handleColorVisionChange = (mode: string) => {
		if (mode === "normal") {
			setTheme(lastBaseTheme.current);
			return;
		}
		setTheme(mode as ThemeOption);
	};

	const toggleReduceMotion = () => {
		const newValue = !reduceMotion;
		setReduceMotion(newValue);
		if (typeof document !== "undefined") {
			localStorage.setItem("reduce-motion", newValue.toString());
		}
	};

	// state → système externe (application DOM déléguée à l'applier du paquet)
	useEffect(() => {
		applyReduceMotion(reduceMotion);
	}, [reduceMotion]);

	const labels = {
		categories: {
			mode: language === "fr" ? "Mode" : "Mode",
			contrast: language === "fr" ? "Contraste" : "Contrast",
			vision: language === "fr" ? "Vision" : "Vision",
			reading: language === "fr" ? "Lecture" : "Reading",
		},
		themes: {
			light: language === "fr" ? "Clair" : "Light",
			dark: language === "fr" ? "Sombre" : "Dark",
			comfort: language === "fr" ? "Confort" : "Comfort",
		},
		visualHelps: {
			highContrast: {
				name: language === "fr" ? "Contraste élevé" : "High contrast",
				description:
					language === "fr"
						? "Pour les fortes pertes de vision"
						: "For severe vision loss",
				variantLabel:
					language === "fr" ? "Couleurs du contraste" : "Contrast colors",
				variants: {
					"high-contrast":
						language === "fr" ? "Jaune sur noir" : "Yellow on black",
					"high-contrast-green":
						language === "fr" ? "Vert sur noir" : "Green on black",
					"high-contrast-white":
						language === "fr" ? "Blanc sur noir" : "White on black",
					"high-contrast-paper":
						language === "fr" ? "Noir sur blanc" : "Black on white",
				} as Record<HcVariant, string>,
			},
			antiGlare: {
				name: language === "fr" ? "Anti-éblouissement" : "Anti-glare",
				description:
					language === "fr"
						? "Pour photophobie, kératocône, DMLA, aniridie."
						: "For photophobia, keratoconus, AMD, aniridia.",
			},
			reduceMotion: {
				name:
					language === "fr" ? "Réduire les animations" : "Reduce animations",
				description:
					language === "fr"
						? "Pour les troubles vestibulaires et la sensibilité aux mouvements"
						: "For vestibular disorders and motion sensitivity",
			},
		},
		colorVision: {
			group: language === "fr" ? "Daltonisme" : "Color blindness",
			normal: language === "fr" ? "Normal" : "Normal",
			protanomaly: "Protanomalie",
			protanopia: "Protanopie",
			deuteranomaly: "Deutéranomalie",
			deuteranopia: "Deutéranopie",
			tritanomaly: "Tritanomalie",
			tritanopia: "Tritanopie",
			achromatopsia: "Achromatopsie",
			selectLabel: language === "fr" ? "Type de vision" : "Vision type",
		},
		fontSize: {
			label: language === "fr" ? "Taille du texte" : "Text size",
		},
		dyslexic: {
			toggle: language === "fr" ? "Mode dyslexie" : "Dyslexia mode",
			active: language === "fr" ? "Activé" : "Enabled",
			inactive: language === "fr" ? "Désactivé" : "Disabled",
			label: language === "fr" ? "Type de police" : "Font type",
			group: {
				dyslexic: language === "fr" ? "Pour dyslexie" : "For dyslexia",
				legibility: language === "fr" ? "Haute lisibilité" : "High legibility",
				easyReading: language === "fr" ? "Lecture facilitée" : "Easy reading",
			},
			none: language === "fr" ? "Standard" : "Standard",
			openDyslexic: "OpenDyslexic",
			atkinson: "Atkinson Hyperlegible",
			andika: "Andika",
		},
	};

	if (!mounted) {
		return <div className="accessibility-menu skeleton"></div>;
	}

	const isAntiGlareActive =
		theme === "anti-glare-light" || theme === "anti-glare-dark";

	const resetAllAccessibilitySettings = () => {
		setTheme(prefersDarkMode ? "dark" : "light");
		setFontSize(100);
		setFontType("none");
		setHcVariant("high-contrast");
		localStorage.removeItem("hc-variant");
		if (isDyslexicMode) {
			document.documentElement.classList.remove("dyslexia-optimized");
			setIsDyslexicMode(false);
		}
	};

	const getSelectStyles = (): StylesConfig<
		OptionType,
		false,
		GroupBase<OptionType>
	> => ({
		control: (base) => ({
			...base,
			backgroundColor: "var(--color-panel-bg)",
			borderColor: "var(--color-button-border)",
			"&:hover": { borderColor: "var(--accent)" },
		}),
		menu: (base) => ({ ...base, backgroundColor: "var(--color-panel-bg)" }),
		option: (base, state) => ({
			...base,
			backgroundColor: state.isFocused
				? "var(--color-button-hover-bg)"
				: "transparent",
			color: "var(--color-main-text)",
			"&:hover": { backgroundColor: "var(--color-button-hover-bg)" },
		}),
	});

	const getFontTypeLabel = (type: string): string => {
		if (type === "opendyslexic") return labels.dyslexic.openDyslexic;
		if (type === "atkinson") return labels.dyslexic.atkinson;
		if (type === "andika") return labels.dyslexic.andika;
		return labels.dyslexic.none;
	};

	const getColorVisionLabel = (mode: string): string => {
		const map: Record<string, string> = {
			normal: labels.colorVision.normal,
			protanomaly: labels.colorVision.protanomaly,
			protanopia: labels.colorVision.protanopia,
			deuteranomaly: labels.colorVision.deuteranomaly,
			deuteranopia: labels.colorVision.deuteranopia,
			tritanomaly: labels.colorVision.tritanomaly,
			tritanopia: labels.colorVision.tritanopia,
			achromatopsia: labels.colorVision.achromatopsia,
		};
		return map[mode] ?? mode;
	};

	// Ouverture fiable du select au clavier (Enter/Espace fermés → ouvre ;
	// Tab dans le menu ouvert → flèches). Appelée dans une closure au keydown
	// (la ref est lue à l'événement, jamais au rendu).
	const handleSelectKeyDown = (
		e: ReactKeyboardEvent<HTMLElement>,
		ref: RefObject<SelectInstance<OptionType> | null>,
	) => {
		const menuOpen = document.querySelector('[role="listbox"]') !== null;
		if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
			e.preventDefault();
			ref.current?.openMenu("first");
		}
		if (menuOpen && e.key === "Tab") {
			e.preventDefault();
			const key = e.shiftKey ? "ArrowUp" : "ArrowDown";
			e.currentTarget.dispatchEvent(
				new KeyboardEvent("keydown", { key, bubbles: true }),
			);
		}
	};

	return (
		<div
			className="accessibility-menu"
			tabIndex={-1}
			aria-label={
				language === "fr" ? "Menu d'accessibilité" : "Accessibility menu"
			}>
			<div className="accessibility-menu__header">
				<h2 className="accessibility-menu__main-title">
					{language === "fr"
						? "Options d'accessibilité"
						: "Accessibility Options"}
				</h2>
				{onClose && (
					<button
						className="accessibility-menu__close-button"
						onClick={onClose}
						aria-label={language === "fr" ? "Fermer le menu" : "Close menu"}>
						×
					</button>
				)}
			</div>

			{/* Catégorie Mode */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.mode}
				</h3>
				<div className="accessibility-menu__buttons-row">
					<button
						className={`accessibility-menu__button ${
							theme === "light" ? "active" : ""
						}`}
						onClick={() => setTheme("light")}>
						{labels.themes.light}
					</button>
					<button
						className={`accessibility-menu__button ${
							theme === "dark" ? "active" : ""
						}`}
						onClick={() => setTheme("dark")}>
						{labels.themes.dark}
					</button>
					<button
						className={`accessibility-menu__button accessibility-menu__button-full-width ${
							isAntiGlareActive ? "active" : ""
						}`}
						onClick={activateAntiGlare}>
						{labels.themes.comfort}
					</button>
				</div>
			</div>

			{/* Catégorie Vision */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.vision}
				</h3>

				{/* Fort contraste */}
				<div className="accessibility-menu__visual-help-group">
					<p className="accessibility-menu__group-label">
						{labels.categories.contrast}
					</p>
					<p className="accessibility-menu__help-description">
						{labels.visualHelps.highContrast.description}
					</p>
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button accessibility-menu__high-contrast-button ${
								theme.startsWith("high-contrast") ? "active" : ""
							}`}
							onClick={() => setTheme(hcVariant)}>
							{labels.visualHelps.highContrast.name}
						</button>
					</div>

					{/* 4 boutons de variantes, visibles quand le mode est actif —
					    chaque bouton = mini-prévisualisation (libellé complet dans
					    les couleurs réelles de sa variante). */}
					{theme.startsWith("high-contrast") && (
						<div
							className="accessibility-menu__buttons-row accessibility-menu__buttons-row--hc-variants"
							role="group"
							aria-label={labels.visualHelps.highContrast.variantLabel}>
							{(
								[
									"high-contrast",
									"high-contrast-green",
									"high-contrast-white",
									"high-contrast-paper",
								] as const
							).map((variant) => (
								<button
									key={variant}
									className={`accessibility-menu__button accessibility-menu__hc-variant-button accessibility-menu__hc-variant-button--${HC_VARIANT_MODIFIERS[variant]} ${
										theme === variant ? "active" : ""
									}`}
									aria-pressed={theme === variant}
									onClick={() => selectHcVariant(variant)}>
									{theme === variant && <span aria-hidden="true">✓ </span>}
									{labels.visualHelps.highContrast.variants[variant]}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Anti-éblouissement */}
				<div className="accessibility-menu__visual-help-group">
					<p className="accessibility-menu__help-description">
						{labels.visualHelps.antiGlare.description}
					</p>
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button ${
								theme === "anti-glare-light" ? "active" : ""
							}`}
							onClick={activateAntiGlareLight}>
							{labels.visualHelps.antiGlare.name}
						</button>
					</div>
				</div>

				{/* Réduction des animations */}
				<div className="accessibility-menu__visual-help-group">
					<p className="accessibility-menu__help-description">
						{labels.visualHelps.reduceMotion.description}
					</p>
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button ${
								reduceMotion ? "active" : ""
							}`}
							onClick={toggleReduceMotion}
							aria-pressed={reduceMotion}>
							{labels.visualHelps.reduceMotion.name}
						</button>
					</div>
				</div>

				{/* Daltonisme */}
				<div className="accessibility-menu__visual-help-group">
					<label
						htmlFor="color-vision-select"
						className="accessibility-menu__group-label">
						{labels.colorVision.group}
					</label>
					<Select
						ref={colorVisionSelectRef}
						inputId="color-vision-select"
						className="react-select-container"
						classNamePrefix="react-select"
						value={{
							value: getColorVisionMode(theme),
							label: getColorVisionLabel(getColorVisionMode(theme)),
						}}
						onChange={(option) => {
							if (option) handleColorVisionChange((option as OptionType).value);
						}}
						options={[
							{ value: "normal", label: labels.colorVision.normal },
							{ value: "protanomaly", label: labels.colorVision.protanomaly },
							{ value: "protanopia", label: labels.colorVision.protanopia },
							{ value: "deuteranomaly", label: labels.colorVision.deuteranomaly },
							{ value: "deuteranopia", label: labels.colorVision.deuteranopia },
							{ value: "tritanomaly", label: labels.colorVision.tritanomaly },
							{ value: "tritanopia", label: labels.colorVision.tritanopia },
							{ value: "achromatopsia", label: labels.colorVision.achromatopsia },
						]}
						aria-label={labels.colorVision.selectLabel}
						styles={getSelectStyles()}
						isSearchable={false}
						menuPortalTarget={
							typeof document !== "undefined" ? document.body : null
						}
						menuPosition="fixed"
						menuShouldBlockScroll={true}
						openMenuOnFocus={false}
						closeMenuOnSelect={true}
						onKeyDown={(e) => handleSelectKeyDown(e, colorVisionSelectRef)}
					/>
				</div>
			</div>

			{/* Catégorie Lecture */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.reading}
				</h3>

				{/* Mode dyslexie optimisé */}
				<div className="accessibility-menu__visual-help-group">
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button accessibility-menu__button-full-width ${
								isDyslexicMode ? "active" : ""
							}`}
							onClick={toggleDyslexicMode}
							aria-pressed={isDyslexicMode}>
							{labels.dyslexic.toggle}:{" "}
							{isDyslexicMode ? labels.dyslexic.active : labels.dyslexic.inactive}
						</button>
					</div>
				</div>

				{/* Taille de texte */}
				<div className="accessibility-menu__font-control">
					<div className="accessibility-menu__slider-header">
						<label
							htmlFor="font-size-slider"
							className="accessibility-menu__group-label">
							{labels.fontSize.label}
						</label>
						<div className="accessibility-menu__size-display">
							<span className="accessibility-menu__font-size-value">
								{fontSize}%
							</span>
							<button
								className="accessibility-menu__reset-button"
								onClick={() => setFontSize(100)}
								aria-label={
									language === "fr" ? "Réinitialiser à 100%" : "Reset to 100%"
								}>
								<span className="accessibility-menu__reset-icon">↺</span>
							</button>
						</div>
					</div>
					<div className="accessibility-menu__slider-container">
						<span className="accessibility-menu__slider-label">A</span>
						<input
							type="range"
							id="font-size-slider"
							className="accessibility-menu__slider"
							min="75"
							max="150"
							step="25"
							value={fontSize}
							onChange={(e) => setFontSize(parseInt(e.target.value))}
							aria-label={labels.fontSize.label}
							aria-valuemin={75}
							aria-valuemax={150}
							aria-valuenow={fontSize}
						/>
						<span className="accessibility-menu__slider-label accessibility-menu__slider-label--large">
							A
						</span>
					</div>
				</div>

				{/* Police d'accessibilité */}
				<div className="accessibility-menu__select-control">
					<label
						htmlFor="font-type-select"
						className="accessibility-menu__group-label">
						{labels.dyslexic.label}
					</label>
					<Select
						ref={fontTypeSelectRef}
						inputId="font-type-select"
						className="react-select-container"
						classNamePrefix="react-select"
						value={{ value: fontType, label: getFontTypeLabel(fontType) }}
						onChange={(option) => {
							if (option) {
								const value = (option as OptionType).value as FontType;
								if (isDyslexicMode && value !== "none") {
									setIsDyslexicMode(false);
								}
								setFontType(value);
							}
						}}
						options={[
							{ value: "none", label: labels.dyslexic.none },
							{
								label: labels.dyslexic.group.dyslexic,
								options: [
									{ value: "opendyslexic", label: labels.dyslexic.openDyslexic },
								],
							},
							{
								label: labels.dyslexic.group.legibility,
								options: [
									{ value: "atkinson", label: labels.dyslexic.atkinson },
								],
							},
							{
								label: labels.dyslexic.group.easyReading,
								options: [{ value: "andika", label: labels.dyslexic.andika }],
							},
						]}
						aria-label={labels.dyslexic.label}
						styles={getSelectStyles()}
						isSearchable={false}
						menuPortalTarget={
							typeof document !== "undefined" ? document.body : null
						}
						menuPosition="fixed"
						menuShouldBlockScroll={true}
						openMenuOnFocus={false}
						closeMenuOnSelect={true}
						onKeyDown={(e) => handleSelectKeyDown(e, fontTypeSelectRef)}
					/>
				</div>
			</div>

			{/* Réinitialisation */}
			<div className="accessibility-menu__reset-section">
				<button
					className="accessibility-menu__reset-all-button"
					onClick={resetAllAccessibilitySettings}
					aria-label={
						language === "fr"
							? "Réinitialiser tous les paramètres"
							: "Reset all settings"
					}>
					{language === "fr"
						? "Réinitialiser tous les paramètres"
						: "Reset all settings"}
				</button>
			</div>

			{/* Lien vers la déclaration d'accessibilité (si fourni) */}
			{complianceUrl && (
				<div className="accessibility-menu__compliance-link">
					<a
						href={complianceUrl}
						className="accessibility-menu__accessibility-link"
						aria-label={
							language === "fr"
								? "Accessibilité : déclaration de conformité"
								: "Accessibility: compliance statement"
						}>
						<FaUniversalAccess className="accessibility-menu__accessibility-icon" />
						<span>
							{language === "fr"
								? "Accessibilité : déclaration de conformité"
								: "Accessibility: compliance statement"}
						</span>
					</a>
				</div>
			)}

			{onClose && (
				<div className="accessibility-menu__footer">
					<button
						className="accessibility-menu__close-footer-button"
						onClick={onClose}>
						{language === "fr" ? "Fermer" : "Close"}
					</button>
				</div>
			)}
		</div>
	);
}
