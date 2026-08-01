/** @format */

"use client";

import { useTheme } from "../../hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePrefersDarkMode } from "../../hooks/usePrefersDarkMode";
import {
	useFontSize,
	useDyslexicFont,
} from "../../hooks/useAccessibilityPreferences";
import {
	A11Y_COLOR_VISION_KEY,
	A11Y_DYSLEXIA_CLASS,
	A11Y_DYSLEXIA_KEY,
	COLOR_VISION_MODES,
	DYSLEXIC_FONT_GROUPS,
	FONT_SIZE_DEFAULT,
	type DyslexicFontType,
} from "@/config/accessibilityPreferences";
import { resolveColorVisionModes } from "darkmode-plus-a11y/react/detectThemes";
import { applyReduceMotion } from "darkmode-plus-a11y/react/appliers";
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

export default function AccessibilityMenu({ language, onClose }: Props) {
	// useIsMounted replaces useState(false) + useEffect(setMounted, []) — no setState in effect
	const mounted = useIsMounted();
	const { theme, setTheme } = useTheme();
	// Both hooks read localStorage lazily and apply the DOM side effect
	// themselves, under the same keys the anti-FOUC script reads before the
	// first paint. No effect below needs to re-apply them.
	const [fontSize, setFontSize] = useFontSize();
	const [fontType, setFontType] = useDyslexicFont();
	// Lazily initialised from localStorage, like reduceMotion below. Without
	// it the mode was lost on every reload — the one setting a user had to
	// switch back on at each visit.
	const [isDyslexicMode, setIsDyslexicMode] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem(A11Y_DYSLEXIA_KEY) === "true";
	});
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
	// Colour-vision modes this site actually implements, read once from the
	// loaded CSS. Computed lazily: the menu renders a skeleton until
	// `mounted`, so there is no server/client mismatch to worry about.
	const [colorVisionModes] = useState<readonly string[]>(() =>
		typeof document === "undefined"
			? []
			: resolveColorVisionModes(COLOR_VISION_MODES),
	);
	// Last colour-vision mode used, so the parent button can bring it back —
	// same pattern as `hcVariant` below.
	const [lastColorVision, setLastColorVision] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(A11Y_COLOR_VISION_KEY);
	});
	// Last accessibility font used, same reason. Seeded from the restored
	// preference so the toggle brings back the font the visitor had, not a
	// default, after a reload.
	const lastFont = useRef<DyslexicFontType>(
		fontType !== "none" ? fontType : "opendyslexic",
	);
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
		localStorage.setItem(A11Y_DYSLEXIA_KEY, String(newMode));

		if (newMode) {
			// Activate the optimized dyslexia mode and deactivate the others
			document.documentElement.classList.add(A11Y_DYSLEXIA_CLASS);

			// Reset the font selector
			if (fontType !== "none") {
				setFontType("none");
			}
		} else {
			// Deactivate the optimized dyslexia mode
			document.documentElement.classList.remove(A11Y_DYSLEXIA_CLASS);
		}
	};

	// Add this useEffect to initialize
	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			if (isDyslexicMode) {
				document.documentElement.classList.add(A11Y_DYSLEXIA_CLASS);
			} else {
				document.documentElement.classList.remove(A11Y_DYSLEXIA_CLASS);
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

	// The two effects that used to re-apply the size and the font on mount
	// are gone: useFontSize/useDyslexicFont apply them themselves, and the
	// anti-FOUC script has already done it before the first paint. The font
	// one also wrote to localStorage on every mount.

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

		// Extract the color blindness type from the theme name. The list is
		// the one detected from the CSS, so it cannot drift from what the
		// buttons offer.
		for (const type of colorVisionModes) {
			if (currentTheme.includes(type)) {
				return type;
			}
		}

		return "normal";
	};

	// Pick one colour-vision mode. Remembered so the parent button can
	// bring it back, exactly like `hc-variant`.
	const selectColorVisionMode = (mode: string) => {
		setLastColorVision(mode);
		localStorage.setItem(A11Y_COLOR_VISION_KEY, mode);
		setTheme(mode as ThemeOption);
	};

	// Parent button: turn the last used mode back on, or leave for the base
	// theme. "Normal" is this off state, not a button in the row — one
	// button fewer, and no row that hides itself when you use it.
	const toggleColorVision = () => {
		if (getColorVisionMode(theme) !== "normal") {
			setTheme(lastBaseTheme.current);
			return;
		}
		const mode =
			lastColorVision && colorVisionModes.includes(lastColorVision)
				? lastColorVision
				: colorVisionModes[0];
		if (mode) selectColorVisionMode(mode);
	};

	// Pick one accessibility font. Choosing a font leaves the dyslexia
	// mode, which drives the whole typography on its own.
	const selectAccessibilityFont = (type: DyslexicFontType) => {
		lastFont.current = type;
		if (isDyslexicMode) setIsDyslexicMode(false);
		setFontType(type);
	};

	const toggleAccessibilityFont = () => {
		if (fontType !== "none") {
			setFontType("none");
			return;
		}
		selectAccessibilityFont(lastFont.current);
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

	const currentColorVision = getColorVisionMode(theme);
	const isColorVisionActive = currentColorVision !== "normal";
	const isAccessibilityFontActive = fontType !== "none";

	const resetAllAccessibilitySettings = () => {
		// Reset the theme to the default theme based on system preferences
		setTheme(prefersDarkMode ? "dark" : "light");

		// Reset the font size to 100%
		setFontSize(FONT_SIZE_DEFAULT);

		// Reset the font type
		setFontType("none");

		// Reset the remembered high-contrast variant
		setHcVariant("high-contrast");
		localStorage.removeItem("hc-variant");

		// Reset the remembered colour-vision mode
		setLastColorVision(null);
		localStorage.removeItem(A11Y_COLOR_VISION_KEY);

		// Deactivate the optimized dyslexia mode
		localStorage.removeItem(A11Y_DYSLEXIA_KEY);
		if (isDyslexicMode) {
			document.documentElement.classList.remove(A11Y_DYSLEXIA_CLASS);
			setIsDyslexicMode(false);
		}
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

				{/* Color blindness subsection — direct buttons revealed when
				    the mode is active, same pattern as the high-contrast
				    variants above (decision 2026-07-10: no selector, more
				    robust for NVDA and large zoom levels). The list comes
				    from the loaded CSS: a theme the site does not define
				    never gets a button. */}
				<div className="accessibility-menu__visual-help-group">
					{colorVisionModes.length > 0 && (
						<>
							<div className="accessibility-menu__buttons-row">
								<button
									className={`accessibility-menu__button accessibility-menu__button-full-width ${
										isColorVisionActive ? "active" : ""
									}`}
									aria-pressed={isColorVisionActive}
									onClick={toggleColorVision}>
									{labels.colorVision.group}
								</button>
							</div>

							{isColorVisionActive && (
								<div
									className="accessibility-menu__buttons-row accessibility-menu__buttons-row--cv-modes"
									role="group"
									aria-label={labels.colorVision.selectLabel}>
									{colorVisionModes.map((mode) => (
										<button
											key={mode}
											className={`accessibility-menu__button accessibility-menu__cv-mode-button ${
												currentColorVision === mode ? "active" : ""
											}`}
											aria-pressed={currentColorVision === mode}
											onClick={() => selectColorVisionMode(mode)}>
											{/* Checkmark = visual marker of the active mode; the
											    semantics are carried by aria-pressed. Rendered
											    in every button, and mirrored by an empty slot
											    on the right: the label then stays centred on
											    the button's real axis, selected or not. */}
											<span
												className="accessibility-menu__check"
												aria-hidden="true">
												{currentColorVision === mode ? "✓" : ""}
											</span>
											{getColorVisionLabel(mode)}
											<span
												className="accessibility-menu__check"
												aria-hidden="true"></span>
										</button>
									))}
								</div>
							)}
						</>
					)}
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
								onClick={() => setFontSize(FONT_SIZE_DEFAULT)}
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
								setFontSize(parseInt(e.target.value));
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

				{/* Accessibility font — direct buttons revealed when a font is
				    active, same pattern as the colour-vision row above.
				    "Standard" is not a button: it is the parent's off state. */}
				<div className="accessibility-menu__visual-help-group">
					<div className="accessibility-menu__buttons-row">
						<button
							className={`accessibility-menu__button accessibility-menu__button-full-width ${
								isAccessibilityFontActive ? "active" : ""
							}`}
							aria-pressed={isAccessibilityFontActive}
							onClick={toggleAccessibilityFont}>
							{labels.dyslexic.label}
						</button>
					</div>

					{isAccessibilityFontActive && (
						<div className="accessibility-menu__font-choices">
							{DYSLEXIC_FONT_GROUPS.map((group) => (
								<div
									key={group.id}
									className="accessibility-menu__font-group"
									role="group"
									aria-label={labels.dyslexic.group[group.id]}>
									{/* The heading is what makes the choice possible: the
									    font names mean nothing on their own. */}
									<p className="accessibility-menu__font-group-label">
										{labels.dyslexic.group[group.id]}
									</p>
									<div className="accessibility-menu__buttons-row accessibility-menu__buttons-row--font-choices">
										{group.fonts.map((type) => (
											<button
												key={type}
												className={`accessibility-menu__button accessibility-menu__font-choice-button ${
													fontType === type ? "active" : ""
												}`}
												aria-pressed={fontType === type}
												onClick={() => selectAccessibilityFont(type)}>
												{/* Checkmark = visual marker of the active font; the
												    semantics are carried by aria-pressed. Rendered
												    in every button, and mirrored by an empty slot
												    on the right: the label then stays centred on
												    the button's real axis, selected or not. */}
												<span
													className="accessibility-menu__check"
													aria-hidden="true">
													{fontType === type ? "✓" : ""}
												</span>
												{getFontTypeLabel(type)}
												<span
													className="accessibility-menu__check"
													aria-hidden="true"></span>
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					)}
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
