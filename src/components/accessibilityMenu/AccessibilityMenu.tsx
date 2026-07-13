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
import { applyReduceMotion } from "a11y-prefs/react/appliers";
import { FaUniversalAccess } from "react-icons/fa";
import { useIsMounted } from "../../hooks/useIsMounted";
import { ThemeOption } from "@/config/themes";

type Props = {
	language: string;
	onClose?: () => void;
};

// High-contrast mode variants (HC chantier) — "high-contrast" = yellow on
// black, historical value kept
type HcVariant =
	| "high-contrast"
	| "high-contrast-green"
	| "high-contrast-white"
	| "high-contrast-paper";

// SCSS modifier for each variant button (the actual colors live in
// _accessibility-menu.scss, __high-contrast-button pattern)
const HC_VARIANT_MODIFIERS: Record<HcVariant, string> = {
	"high-contrast": "yellow",
	"high-contrast-green": "green",
	"high-contrast-white": "white",
	"high-contrast-paper": "paper",
};

type OptionType = {
	value: string;
	label: string;
};

export default function AccessibilityMenu({ language, onClose }: Props) {
	// useIsMounted replaces useState(false) + useEffect(setMounted, []) — no setState in effect
	const mounted = useIsMounted();
	const { theme, setTheme } = useTheme();
	const { fontSize } = useFontSizeStore();
	const { fontType, setFontType } = useDyslexicFontStore();
	const [isDyslexicMode, setIsDyslexicMode] = useState(false);
	// reduceMotion is lazily initialised from localStorage / matchMedia — no setState in any effect
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
	// Last high-contrast variant used (ZoomText pattern: the toggle
	// reactivates the last chosen scheme) — lazy localStorage init
	const [hcVariant, setHcVariant] = useState<HcVariant>(() => {
		if (typeof window === "undefined") return "high-contrast";
		const saved = localStorage.getItem("hc-variant");
		return saved === "high-contrast-green" ||
			saved === "high-contrast-white" ||
			saved === "high-contrast-paper"
			? saved
			: "high-contrast";
	});

	// Function to toggle the optimized dyslexia mode
	const toggleDyslexicMode = () => {
		const newMode = !isDyslexicMode;
		setIsDyslexicMode(newMode);

		if (newMode) {
			// Activate the optimized dyslexia mode and deactivate the others
			document.documentElement.classList.add("dyslexia-optimized");

			// Reset the font selector
			if (fontType !== "none") {
				setFontType("none");
			}
		} else {
			// Deactivate the optimized dyslexia mode
			document.documentElement.classList.remove("dyslexia-optimized");
		}
	};

	// Add this useEffect to initialize
	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			if (isDyslexicMode) {
				document.documentElement.classList.add("dyslexia-optimized");
			} else {
				document.documentElement.classList.remove("dyslexia-optimized");
			}
		}
	}, [mounted, isDyslexicMode]);

	// Add a new effect to handle coordination between the two features
	// Removed: the Select onChange handler already calls setIsDyslexicMode(false)
	// when a non-'none' font is selected, making this effect redundant.

	// Update the reference to the last base theme
	useEffect(() => {
		if (theme === "light" || theme === "dark") {
			lastBaseTheme.current = theme;
		}
	}, [theme]);

	useEffect(() => {
		if (typeof document !== "undefined" && mounted) {
			// Apply the initial size on load
			document.documentElement.style.setProperty(
				"--font-size-factor",
				`${fontSize / 100}`,
			);
		}
	}, [mounted, fontSize]);

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			// The store's setFontType function will handle applying the classes
			setFontType(fontType);
		}
	}, [mounted, fontType, setFontType]);

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			// The typography class applies to ALL high-contrast variants
			if (theme.startsWith("high-contrast")) {
				document.documentElement.classList.add("high-contrast");
			} else {
				document.documentElement.classList.remove("high-contrast");
			}
		}
	}, [mounted, theme]);

	// Remember the last high-contrast variant used (the toggle will
	// reactivate it). Called by the variant selector — no effect, the
	// project rule forbids setState inside an effect.
	const selectHcVariant = (variant: HcVariant) => {
		setHcVariant(variant);
		localStorage.setItem("hc-variant", variant);
		setTheme(variant);
	};

	// Function to activate anti-glare mode
	const activateAntiGlare = () => {
		setTheme(
			lastBaseTheme.current === "dark" ? "anti-glare-dark" : "anti-glare-light",
		);
	};

	// Extract the color vision mode from the theme
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

		// Extract the color blindness type from the theme name
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

	// Handle the color vision mode change
	const handleColorVisionChange = (mode: string) => {
		if (mode === "normal") {
			// Return to the base theme (light/dark)
			setTheme(lastBaseTheme.current);
			return;
		}

		// Apply the selected color blindness theme
		setTheme(mode as ThemeOption);
	};

	const toggleReduceMotion = () => {
		const newValue = !reduceMotion;
		setReduceMotion(newValue);

		if (typeof document !== "undefined") {
			// Save the preference (DOM class is synced by the useEffect below)
			localStorage.setItem("reduce-motion", newValue.toString());
		}
	};

	// Sync reduce-motion DOM class from state (correct effect direction: state → external system)
	// reduceMotion is lazily initialised — this also applies the initial value on first render.
	// DOM application is delegated to the package's applier (E5) — identical behavior.
	useEffect(() => {
		applyReduceMotion(reduceMotion);
	}, [reduceMotion]);

	// Labels depending on the language
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
	// Function specific to the anti-glare button in Vision
	const activateAntiGlareLight = () => {
		// Always activate the light version for this specific button
		setTheme("anti-glare-light");
	};

	// Check whether one of the anti-glare modes is active
	const isAntiGlareActive =
		theme === "anti-glare-light" || theme === "anti-glare-dark";

	const resetAllAccessibilitySettings = () => {
		// Reset the theme to the default theme based on system preferences
		setTheme(prefersDarkMode ? "dark" : "light");

		// Reset the font size to 100%
		useFontSizeStore.getState().setFontSize(100);

		// Reset the font type
		setFontType("none");

		// Reset the remembered high-contrast variant
		setHcVariant("high-contrast");
		localStorage.removeItem("hc-variant");

		// Deactivate the optimized dyslexia mode
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
		// Default styles adapted to the current theme
		return {
			control: (base) => ({
				...base,
				backgroundColor: "var(--color-panel-bg)",
				borderColor: "var(--color-button-border)",
				"&:hover": {
					borderColor: "var(--accent)",
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

			{/* Mode category */}
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

			{/* Vision category */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.vision}
				</h3>
				{/* High contrast subsection */}
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
								theme.startsWith("high-contrast") ? "active" : ""
							}`}
							onClick={() => setTheme(hcVariant)}>
							{labels.visualHelps.highContrast.name}
						</button>
					</div>

					{/* High-contrast variants — 4 direct buttons, visible when
					    the mode is active (decision 2026-07-10: no selector,
					    more robust for NVDA and high zoom). Each button =
					    a mini preview: full label rendered in its variant's
					    actual colors. */}
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
									{/* Checkmark = visual marker of the active variant; the
									    semantics are carried by aria-pressed */}
									{theme === variant && <span aria-hidden="true">✓ </span>}
									{labels.visualHelps.highContrast.variants[variant]}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Anti-glare subsection */}
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

				{/* Reduce animations subsection */}
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

				{/* Color blindness subsection - unchanged */}
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
						// Simplified handler that doesn't block standard behavior
						onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
							const menuOpen =
								document.querySelector('[role="listbox"]') !== null;

							// If the menu is closed and Enter or Space is pressed
							if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();

								// Reliably open the menu
								if (colorVisionSelectRef.current) {
									colorVisionSelectRef.current.openMenu("first");
								}
							}

							// If the menu is open
							if (menuOpen) {
								// For Tab and Shift+Tab, simulate the arrow keys
								if (e.key === "Tab") {
									e.preventDefault();

									// Simulate arrow down or up depending on Shift
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

			{/* Reading category */}
			<div className="accessibility-menu__category">
				<h3 className="accessibility-menu__category-title">
					{labels.categories.reading}
				</h3>

				{/* Dyslexia button */}
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

				{/* Font size control */}
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
								// Use the store's setFontSize function
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

				{/* Dyslexia font toggle */}
				<div className="accessibility-menu__select-control">
					<label
						htmlFor="font-type-select"
						className="accessibility-menu__group-label">
						{labels.dyslexic.label}
					</label>

					<Select
						ref={fontTypeSelectRef} // Add the reference
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
						} // 👈 Add this
						menuPosition="fixed" // 👈 Add this
						menuShouldBlockScroll={true}
						openMenuOnFocus={false}
						closeMenuOnSelect={true}
						// Add the keyboard event handler for navigation
						onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
							const menuOpen =
								document.querySelector('[role="listbox"]') !== null;

							// If the menu is closed and Enter or Space is pressed
							if (!menuOpen && (e.key === "Enter" || e.key === " ")) {
								e.preventDefault();

								// Reliably open the menu
								if (fontTypeSelectRef.current) {
									fontTypeSelectRef.current.openMenu("first");
								}
							}

							// If the menu is open
							if (menuOpen) {
								// For Tab and Shift+Tab, simulate the arrow keys
								if (e.key === "Tab") {
									e.preventDefault();

									// Simulate arrow down or up depending on Shift
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

							// If the optimized dyslexia mode is active, deactivate it
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

			{/* Reset section */}
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

			{/* Link to the accessibility statement */}
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
