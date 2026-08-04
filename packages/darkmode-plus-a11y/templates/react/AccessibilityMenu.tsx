/** @format */

"use client";

// Accessibility card (scaffolded template — you own it, edit freely).
// State via the package's `usePreference` hook (no store to install),
// package fonts only, no
// framework dependency (no next/link).
//
// ⚠️ Imports use the published package name; `init --pkg <name>` rewrites
// them if you installed the package under a different name.

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { FaUniversalAccess } from "react-icons/fa";
import {
	useTheme,
	usePrefersDarkMode,
	resolveColorVisionModes,
	type ThemeOption,
} from "darkmode-plus-a11y/react";
import { applyReduceMotion } from "darkmode-plus-a11y/react/appliers";
import {
	useFontSize,
	useAccessibilityFont,
	ACCESSIBILITY_FONT_GROUPS,
	A11Y_COLOR_VISION_KEY,
	A11Y_DYSLEXIA_KEY,
	A11Y_DYSLEXIA_CLASS,
	COLOR_VISION_MODES,
} from "./accessibilityPreferences";

// false on the server, true after hydration — without violating
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
	/** Link to your accessibility statement (optional). */
	complianceUrl?: string;
};

// High-contrast mode variants — "high-contrast" = yellow on black.
type HcVariant =
	| "high-contrast"
	| "high-contrast-green"
	| "high-contrast-white"
	| "high-contrast-paper";

// SCSS modifier for each variant button (actual colors live in the SCSS,
// __hc-variant-button pattern).
const HC_VARIANT_MODIFIERS: Record<HcVariant, string> = {
	"high-contrast": "yellow",
	"high-contrast-green": "green",
	"high-contrast-white": "white",
	"high-contrast-paper": "paper",
};

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
	// isDyslexicMode: lazy init from localStorage, same as reduceMotion and
	// hcVariant below. Without it the mode is lost on every reload — the one
	// setting a user had to switch back on at each visit.
	const [isDyslexicMode, setIsDyslexicMode] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem(A11Y_DYSLEXIA_KEY) === "true";
	});
	// reduceMotion: lazy init (localStorage / prefers-reduced-motion)
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
	// Last colour-vision mode used, so the parent button brings it back —
	// same pattern as `hcVariant` below.
	const [lastColorVision, setLastColorVision] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(A11Y_COLOR_VISION_KEY);
	});
	// Last accessibility font used, seeded from the restored preference so
	// the toggle brings back the visitor's font after a reload, not a
	// default.
	const lastFont = useRef<FontType>(
		fontType !== "none" ? (fontType as FontType) : "opendyslexic",
	);
	// Last high-contrast variant used (the toggle reactivates it).
	const [hcVariant, setHcVariant] = useState<HcVariant>(() => {
		if (typeof window === "undefined") return "high-contrast";
		const saved = localStorage.getItem("hc-variant");
		return saved === "high-contrast-green" ||
			saved === "high-contrast-white" ||
			saved === "high-contrast-paper"
			? saved
			: "high-contrast";
	});

	// Toggle the optimized dyslexia mode (dyslexia-optimized DOM class).
	const toggleDyslexicMode = () => {
		const newMode = !isDyslexicMode;
		setIsDyslexicMode(newMode);
		localStorage.setItem(A11Y_DYSLEXIA_KEY, String(newMode));
		if (newMode) {
			document.documentElement.classList.add(A11Y_DYSLEXIA_CLASS);
			if (fontType !== "none") setFontType("none");
		} else {
			document.documentElement.classList.remove(A11Y_DYSLEXIA_CLASS);
		}
	};

	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			document.documentElement.classList.toggle(
				A11Y_DYSLEXIA_CLASS,
				isDyslexicMode,
			);
		}
	}, [mounted, isDyslexicMode]);

	useEffect(() => {
		if (theme === "light" || theme === "dark") {
			lastBaseTheme.current = theme;
		}
	}, [theme]);

	// The high-contrast typography class applies to ALL variants.
	useEffect(() => {
		if (mounted && typeof document !== "undefined") {
			document.documentElement.classList.toggle(
				"high-contrast",
				theme.startsWith("high-contrast"),
			);
		}
	}, [mounted, theme]);

	// Remember the last high-contrast variant (no effect: the project rule
	// forbids setState inside an effect).
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
		// The list is the one detected from the CSS, so it cannot drift from
		// what the buttons offer.
		for (const type of colorVisionModes) {
			if (currentTheme.includes(type)) return type;
		}
		return "normal";
	};

	// Pick one colour-vision mode. Remembered so the parent button can bring
	// it back, exactly like `hc-variant`.
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

	// Pick one accessibility font. Choosing a font leaves the dyslexia mode,
	// which drives the whole typography on its own.
	const selectAccessibilityFont = (type: FontType) => {
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
			localStorage.setItem("reduce-motion", newValue.toString());
		}
	};

	// state → external system (DOM application delegated to the package's applier)
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

	const currentColorVision = getColorVisionMode(theme);
	const isColorVisionActive = currentColorVision !== "normal";
	const isAccessibilityFontActive = fontType !== "none";

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

	const resetAllAccessibilitySettings = () => {
		setTheme(prefersDarkMode ? "dark" : "light");
		setFontSize(100);
		setFontType("none");
		setHcVariant("high-contrast");
		localStorage.removeItem("hc-variant");
		setLastColorVision(null);
		localStorage.removeItem(A11Y_COLOR_VISION_KEY);
		localStorage.removeItem(A11Y_DYSLEXIA_KEY);
		if (isDyslexicMode) {
			document.documentElement.classList.remove(A11Y_DYSLEXIA_CLASS);
			setIsDyslexicMode(false);
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

				{/* High contrast */}
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

					{/* 4 variant buttons, visible when the mode is active —
					    each button = a mini preview (full label rendered in
					    its variant's actual colors). */}
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

				{/* Anti-glare */}
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

				{/* Reduce animations */}
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

				{/* Colour vision — direct buttons revealed when the mode is
				    active, same pattern as the high-contrast variants above:
				    no selector, which is more robust for screen readers and
				    large zoom levels. The list comes from the loaded CSS, so
				    a theme this site does not define never gets a button. */}
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
											{/* Checkmark = visual marker; the semantics are
											    carried by aria-pressed. Rendered in every
											    button and mirrored on the right so the label
											    stays centred, selected or not. */}
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

				{/* Optimized dyslexia mode */}
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

				{/* Text size */}
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
							{ACCESSIBILITY_FONT_GROUPS.map((group) => (
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
												onClick={() =>
													selectAccessibilityFont(type as FontType)
												}>
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

			{/* Reset */}
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

			{/* Link to the accessibility statement (if provided) */}
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
