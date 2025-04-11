/** @format */

"use client";

import Select, { GroupBase, StylesConfig } from "react-select";

import type { SelectInstance } from "react-select";
import { useTheme } from "../../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePrefersDarkMode } from "../../hooks/usePrefersDarkMode";
import { useFontSizeStore } from "@/store/fontSizeStore";
import { useDyslexicFontStore } from "@/store/dyslexicFontStore";
import { FaUniversalAccess } from "react-icons/fa";
// import CustomSelect from "../customSelect/CustomSelect";

type Props = {
	language: string;
	onClose?: () => void;
};

type OptionType = {
	value: string;
	label: string;
};

export default function AccessibilityMenu({ language, onClose }: Props) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();
	const { fontSize } = useFontSizeStore();
	// const [isDyslexicFont, setIsDyslexicFont] = useState(false);
	// const { isDyslexicFont, toggleDyslexicFont } = useDyslexicFontStore();
	const { fontType, setFontType } = useDyslexicFontStore();
	const [isDyslexicMode, setIsDyslexicMode] = useState(false);
	const [reduceMotion, setReduceMotion] = useState(false);
	const prefersDarkMode = usePrefersDarkMode();
	const lastBaseTheme = useRef<"light" | "dark">(
		prefersDarkMode ? "dark" : "light"
	);
	// const colorVisionSelectRef = useRef<any>(null);
	// const fontTypeSelectRef = useRef<any>(null);

	const colorVisionSelectRef = useRef<SelectInstance<OptionType> | null>(null);
	const fontTypeSelectRef = useRef<SelectInstance<OptionType> | null>(null);

	// Fonction pour basculer le mode dyslexie optimisé
	const toggleDyslexicMode = () => {
		const newMode = !isDyslexicMode;
		setIsDyslexicMode(newMode);

		if (newMode) {
			// Activer le mode dyslexie optimisé et désactiver les autres
			document.documentElement.classList.add("dyslexia-optimized");

			// Réinitialiser le sélecteur de police
			if (fontType !== "none") {
				setFontType("none");
			}
		} else {
			// Désactiver le mode dyslexie optimisé
			document.documentElement.classList.remove("dyslexia-optimized");
		}
	};

	// Ajouter cet useEffect pour initialiser
	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			if (isDyslexicMode) {
				document.documentElement.classList.add("dyslexia-optimized");
			} else {
				document.documentElement.classList.remove("dyslexia-optimized");
			}
		}
	}, [mounted, isDyslexicMode]);

	// Ajoutez un nouvel effet pour gérer la coordination entre les deux fonctionnalités
	// useEffect(() => {
	// 	if (fontType !== "none" && isDyslexicMode) {
	// 		// Si on sélectionne une police dans le menu déroulant, désactiver le mode optimisé
	// 		setIsDyslexicMode(false);
	// 	}
	// }, [fontType]);
	useEffect(() => {
		if (fontType !== "none" && isDyslexicMode) {
			// Si on sélectionne une police dans le menu déroulant, désactiver le mode optimisé
			setIsDyslexicMode(false);
		}
	}, [fontType, isDyslexicMode]);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Mettre à jour la référence du dernier thème de base
	useEffect(() => {
		if (theme === "light" || theme === "dark") {
			lastBaseTheme.current = theme;
		}
	}, [theme]);

	useEffect(() => {
		if (typeof document !== "undefined" && mounted) {
			// Applique la taille initiale au chargement
			document.documentElement.style.setProperty(
				"--font-size-factor",
				`${fontSize / 100}`
			);
		}
	}, [mounted, fontSize]);

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			// La fonction setFontType du store va gérer l'application des classes
			setFontType(fontType);
		}
	}, [mounted, fontType, setFontType]);

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			if (theme === "high-contrast") {
				document.documentElement.classList.add("high-contrast");
			} else {
				document.documentElement.classList.remove("high-contrast");
			}
		}
	}, [mounted, theme]);

	// Fonction pour activer le mode anti-éblouissement
	const activateAntiGlare = () => {
		setTheme(
			lastBaseTheme.current === "dark" ? "anti-glare-dark" : "anti-glare-light"
		);
	};

	// Extraire le mode de vision des couleurs du thème
	const getColorVisionMode = (currentTheme: string): string => {
		if (
			currentTheme === "light" ||
			currentTheme === "dark" ||
			currentTheme === "high-contrast" ||
			currentTheme === "anti-glare-light" ||
			currentTheme === "anti-glare-dark"
		) {
			return "normal";
		}

		// Extraire le type de daltonisme du nom du thème
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
			if (currentTheme.includes(type)) {
				return type;
			}
		}

		return "normal";
	};

	// Gérer le changement de mode de vision
	const handleColorVisionChange = (mode: string) => {
		if (mode === "normal") {
			// Revenir au thème de base (light/dark)
			setTheme(lastBaseTheme.current);
			return;
		}

		// Appliquer le thème de daltonisme sélectionné
		// setTheme(mode as any);
		setTheme(
			mode as
				| "light"
				| "dark"
				| "high-contrast"
				| "anti-glare-light"
				| "anti-glare-dark"
				| "protanomaly"
				| "protanopia"
				| "deuteranomaly"
				| "deuteranopia"
				| "tritanomaly"
				| "tritanopia"
				| "achromatopsia"
		);
	};

	const toggleReduceMotion = () => {
		const newValue = !reduceMotion;
		setReduceMotion(newValue);

		if (typeof document !== "undefined") {
			if (newValue) {
				document.documentElement.classList.add("reduce-motion");
			} else {
				document.documentElement.classList.remove("reduce-motion");
			}

			// Sauvegarder la préférence
			localStorage.setItem("reduce-motion", newValue.toString());
		}
	};

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			// Récupérer la préférence sauvegardée ou la préférence système
			const savedPreference = localStorage.getItem("reduce-motion");
			const prefersReducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;

			// Utiliser la préférence sauvegardée si disponible, sinon la préférence système
			const shouldReduceMotion = savedPreference
				? savedPreference === "true"
				: prefersReducedMotion;

			setReduceMotion(shouldReduceMotion);

			if (shouldReduceMotion) {
				document.documentElement.classList.add("reduce-motion");
			}
		}
	}, [mounted]);

	// Labels selon la langue
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
			},
			antiGlare: {
				name: language === "fr" ? "Anti-éblouissement" : "Anti-glare",
				description:
					language === "fr"
						? "Pour Photophobie, kératocône, DMLA, Aniridie."
						: "For Photophobia, keratoconus, AMD, Aniridia.",
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
			decrease: language === "fr" ? "Réduire" : "Decrease",
			increase: language === "fr" ? "Augmenter" : "Increase",
		},
		dyslexic: {
			toggle: language === "fr" ? "Mode dyslexie" : "Dyslexia mode",
			active: language === "fr" ? "Activé" : "Enabled",
			inactive: language === "fr" ? "Désactivé" : "Disabled",
			modeDescription:
				language === "fr"
					? "Polices spécifiques pour chaque élément"
					: "Specific fonts for each element",

			label: language === "fr" ? "Type de police" : "Font type",
			group: {
				dyslexic: language === "fr" ? "Pour dyslexie" : "For dyslexia",
				legibility: language === "fr" ? "Haute lisibilité" : "High legibility",
				easyReading: language === "fr" ? "Lecture facilitée" : "Easy reading",
			},
			none: language === "fr" ? "Standard" : "Standard",
			openDyslexic: "OpenDyslexic",
			sylexiad: "Sylexiad Sans",
			sylexiadSerif: "Sylexiad Serif",
			atkinson: "Atkinson Hyperlegible",
			andika: "Andika",
			tiresias: "Tiresias",
			ralewayDots: "Raleway Dots",
		},
	};

	if (!mounted) {
		return <div className="accessibility-menu skeleton"></div>;
	}
	// Fonction spécifique pour le bouton anti-éblouissement dans Vision
	const activateAntiGlareLight = () => {
		// Toujours activer la version light pour ce bouton spécifique
		setTheme("anti-glare-light");
	};

	// Vérifier si l'un des modes anti-glare est actif
	const isAntiGlareActive =
		theme === "anti-glare-light" || theme === "anti-glare-dark";

	const resetAllAccessibilitySettings = () => {
		// Réinitialiser le thème au thème par défaut basé sur les préférences système
		setTheme(prefersDarkMode ? "dark" : "light");

		// Réinitialiser la taille de police à 100%
		useFontSizeStore.getState().setFontSize(100);

		// Réinitialiser le type de police
		setFontType("none");

		// Désactiver le mode dyslexie optimisé
		if (isDyslexicMode) {
			document.documentElement.classList.remove("dyslexia-optimized");
			setIsDyslexicMode(false);
		}
	};

	const getSelectStyles = (): StylesConfig<
		OptionType,
		false,
		GroupBase<OptionType>
	> => {
		// Styles par défaut adaptés au thème courant
		return {
			control: (base) => ({
				...base,
				backgroundColor: "var(--color-panel-bg)",
				borderColor: "var(--color-button-border)",
				"&:hover": {
					borderColor: "var(--primary-color)",
				},
			}),
			menu: (base) => ({
				...base,
				backgroundColor: "var(--color-panel-bg)",
				// zIndex: 9999,
			}),
			option: (base, state) => ({
				...base,
				backgroundColor: state.isFocused
					? "var(--color-button-hover-bg)"
					: "transparent",
				color: "var(--color-main-text)",
				"&:hover": {
					backgroundColor: "var(--color-button-hover-bg)",
				},
			}),
		};
	};

	// // //

	const getFontTypeLabel = (type: string): string => {
		if (type === "none") return labels.dyslexic.none;
		if (type === "opendyslexic") return labels.dyslexic.openDyslexic;
		if (type === "sylexiad") return labels.dyslexic.sylexiad;
		if (type === "sylexiad-serif") return labels.dyslexic.sylexiadSerif;
		if (type === "atkinson") return labels.dyslexic.atkinson;
		// if (type === "tiresias") return labels.dyslexic.tiresias;
		if (type === "andika") return labels.dyslexic.andika;
		// if (type === "ralewaydots") return labels.dyslexic.ralewayDots;
		return type; // Fallback
	};

	const getColorVisionLabel = (mode: string): string => {
		if (mode === "normal") return labels.colorVision.normal;
		if (mode === "protanomaly") return labels.colorVision.protanomaly;
		if (mode === "protanopia") return labels.colorVision.protanopia;
		if (mode === "deuteranomaly") return labels.colorVision.deuteranomaly;
		if (mode === "deuteranopia") return labels.colorVision.deuteranopia;
		if (mode === "tritanomaly") return labels.colorVision.tritanomaly;
		if (mode === "tritanopia") return labels.colorVision.tritanopia;
		if (mode === "achromatopsia") return labels.colorVision.achromatopsia;
		return mode;
	};

	// // // // // // // // // // // // // // //

	return (
		<div
			className="accessibility-menu"
			tabIndex={-1}
			aria-label={
				language === "fr" ? "Menu d'accessibilité" : "Accessibility menu"
			}>
			{/* <h2 className="accessibility-menu__main-title">
				{language === "fr"
					? "Options d'accessibilité"
					: "Accessibility Options"}
			</h2> */}

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
				{/* Sous-section Hight Contraste */}
				<div className="accessibility-menu__visual-help-group">
					<p className="accessibility-menu__group-label">
						{labels.categories.contrast}
					</p>
					<p className="accessibility-menu__help-description">
						{labels.visualHelps.highContrast.description}
					</p>
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button  accessibility-menu__high-contrast-button ${
								theme === "high-contrast" ? "active" : ""
							}`}
							onClick={() => setTheme("high-contrast")}>
							{labels.visualHelps.highContrast.name}
						</button>
					</div>
				</div>

				{/* Sous-section Anti-éblouissement */}
				<div className="accessibility-menu__visual-help-group">
					{/* <p className="accessibility-menu__group-label">
						{labels.visualHelps.antiGlare.name}
					</p> */}
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

				{/* Sous-section Réduire les animations */}
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

				{/* Sous-section Daltonisme - inchangée */}
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
							if (option) {
								handleColorVisionChange((option as OptionType).value);
							}
						}}
						options={[
							{ value: "normal", label: labels.colorVision.normal },
							{ value: "protanomaly", label: labels.colorVision.protanomaly },
							{ value: "protanopia", label: labels.colorVision.protanopia },
							{
								value: "deuteranomaly",
								label: labels.colorVision.deuteranomaly,
							},
							{ value: "deuteranopia", label: labels.colorVision.deuteranopia },
							{ value: "tritanomaly", label: labels.colorVision.tritanomaly },
							{ value: "tritanopia", label: labels.colorVision.tritanopia },
							{
								value: "achromatopsia",
								label: labels.colorVision.achromatopsia,
							},
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
						// Gestionnaire simplifié qui ne bloque pas le comportement standard
						onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
							const menuOpen =
								document.querySelector('[role="listbox"]') !== null;

							// Si le menu est fermé et Enter ou Espace est pressé
							if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();

								// Ouvrir le menu de manière fiable
								if (colorVisionSelectRef.current) {
									colorVisionSelectRef.current.openMenu("first");
								}
							}

							// Si le menu est ouvert
							if (menuOpen) {
								// Pour Tab et Shift+Tab, simuler les flèches
								if (e.key === "Tab") {
									e.preventDefault();

									// Simuler flèche bas ou haut selon Shift
									const key = e.shiftKey ? "ArrowUp" : "ArrowDown";
									const event = new KeyboardEvent("keydown", {
										key,
										bubbles: true,
									});
									e.currentTarget.dispatchEvent(event);
								}
							}
						}}
					/>
				</div>
			</div>

			{/* Catégorie Lecture */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.reading}
				</h3>

				{/* Button dyslexique */}
				<div className="accessibility-menu__visual-help-group">
					{/* <p className="accessibility-menu__help-description">
						{labels.dyslexic.modeDescription}
					</p> */}
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button accessibility-menu__button-full-width ${
								isDyslexicMode ? "active" : ""
							}`}
							onClick={toggleDyslexicMode}
							aria-pressed={isDyslexicMode}>
							{labels.dyslexic.toggle}:{" "}
							{isDyslexicMode
								? labels.dyslexic.active
								: labels.dyslexic.inactive}
						</button>
					</div>
				</div>

				{/* Contrôle de taille de police */}
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
								onClick={() => useFontSizeStore.getState().setFontSize(100)}
								aria-label={
									language === "fr" ? "Réinitialiser à 100%" : "Reset to 100%"
								}>
								<span className="accessibility-menu__reset-icon">↺</span>
							</button>
						</div>

						{/* <span className="accessibility-menu__font-size-value">
							{fontSize}%
						</span> */}
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
							onChange={(e) => {
								const value = parseInt(e.target.value);
								// Utiliser la fonction setFontSize du store
								useFontSizeStore.getState().setFontSize(value);
							}}
							aria-label={labels.fontSize.label}
							aria-valuemin={75}
							aria-valuemax={200}
							aria-valuenow={fontSize}
						/>
						<span className="accessibility-menu__slider-label accessibility-menu__slider-label--large">
							A
						</span>
					</div>
				</div>

				{/* Toggle police dyslexique */}
				<div className="accessibility-menu__select-control">
					<label
						htmlFor="font-type-select"
						className="accessibility-menu__group-label">
						{labels.dyslexic.label}
					</label>

					<Select
						ref={fontTypeSelectRef} // Ajouter la référence
						inputId="font-type-select"
						className="react-select-container"
						classNamePrefix="react-select"
						value={{
							value: fontType,
							label: getFontTypeLabel(fontType),
						}}
						onChange={(option) => {
							if (option) {
								const value = (option as OptionType).value as
									| "none"
									| "opendyslexic"
									| "sylexiad"
									| "sylexiad-serif"
									| "atkinson"
									| "andika";
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
									{
										value: "opendyslexic",
										label: labels.dyslexic.openDyslexic,
									},
									{ value: "sylexiad", label: labels.dyslexic.sylexiad },
									{
										value: "sylexiad-serif",
										label: labels.dyslexic.sylexiadSerif,
									},
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
						} // 👈 Ajouter ceci
						menuPosition="fixed" // 👈 Ajouter ceci
						menuShouldBlockScroll={true}
						openMenuOnFocus={false}
						closeMenuOnSelect={true}
						// Ajouter le gestionnaire d'événements clavier pour la navigation
						onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
							const menuOpen =
								document.querySelector('[role="listbox"]') !== null;

							// Si le menu est fermé et Enter ou Espace est pressé
							if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();

								// Ouvrir le menu de manière fiable
								if (fontTypeSelectRef.current) {
									fontTypeSelectRef.current.openMenu("first");
								}
							}

							// Si le menu est ouvert
							if (menuOpen) {
								// Pour Tab et Shift+Tab, simuler les flèches
								if (e.key === "Tab") {
									e.preventDefault();

									// Simuler flèche bas ou haut selon Shift
									const key = e.shiftKey ? "ArrowUp" : "ArrowDown";
									const event = new KeyboardEvent("keydown", {
										key,
										bubbles: true,
									});
									e.currentTarget.dispatchEvent(event);
								}
							}
						}}
					/>

					{/* <Select
						inputId="font-type-select"
						// className="accessibility-menu__select"
						className="react-select-container"
						classNamePrefix="react-select"
						value={{
							value: fontType,
							label: getFontTypeLabel(fontType),
						}}
						onChange={(option) => {
							if (option) {
								const value = (option as OptionType).value as any;
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
									{
										value: "opendyslexic",
										label: labels.dyslexic.openDyslexic,
									},
									{ value: "sylexiad", label: labels.dyslexic.sylexiad },
									{
										value: "sylexiad-serif",
										label: labels.dyslexic.sylexiadSerif,
									},
								],
							},
							{
								label: labels.dyslexic.group.legibility,
								options: [
									{ value: "atkinson", label: labels.dyslexic.atkinson },
									{ value: "tiresias", label: labels.dyslexic.tiresias },
								],
							},
							{
								label: labels.dyslexic.group.easyReading,
								options: [
									{ value: "andika", label: labels.dyslexic.andika },
									{ value: "ralewaydots", label: labels.dyslexic.ralewayDots },
								],
							},
						]}
						aria-label={labels.dyslexic.label}
						styles={getSelectStyles()}
						isSearchable={false}
					/> */}

					{/* <select
						id="font-type-select"
						className="accessibility-menu__select"
						value={fontType}
						onChange={(e) => {
							const value = e.target.value as
								| "none"
								| "opendyslexic"
								| "sylexiad"
								| "sylexiad-serif"
								| "atkinson"
								| "andika"
								| "tiresias"
								| "ralewaydots";

							// Si le mode dyslexie optimisé est actif, le désactiver
							if (isDyslexicMode && value !== "none") {
								setIsDyslexicMode(false);
							}

							setFontType(value);
						}}
						aria-label={labels.dyslexic.label}>
						<option value="none">{labels.dyslexic.none}</option>
						<optgroup label={labels.dyslexic.group.dyslexic}>
							<option value="opendyslexic">
								{labels.dyslexic.openDyslexic}
							</option>
							<option value="sylexiad">{labels.dyslexic.sylexiad}</option>
							<option value="sylexiad-serif">
								{labels.dyslexic.sylexiadSerif}
							</option>
						</optgroup>
						<optgroup label={labels.dyslexic.group.legibility}>
							<option value="atkinson">{labels.dyslexic.atkinson}</option>
							<option value="tiresias">{labels.dyslexic.tiresias}</option>
						</optgroup>
						<optgroup label={labels.dyslexic.group.easyReading}>
							<option value="andika">{labels.dyslexic.andika}</option>
							<option value="ralewaydots">{labels.dyslexic.ralewayDots}</option>
						</optgroup>
					</select> */}
				</div>
			</div>

			{/* Section de réinitialisation */}
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

			{/* Lien vers la déclaration d'accessibilité */}
			<div className="accessibility-menu__compliance-link">
				<Link
					href={`/${language}/accessibility`}
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
				</Link>
			</div>

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
