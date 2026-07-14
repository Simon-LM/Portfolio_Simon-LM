/** @format */

// SSR-safe DOM appliers for accessibility preferences (chantier E5). The
// consumer's state manager (zustand store, React state, context…) keeps
// ownership of the value and its persistence; it delegates the DOM side
// effect to these functions. All are no-ops on the server.

// Text zoom: exposes the factor as the `--font-size-factor` custom property
// (percent 100 -> 1). The host stylesheet multiplies its rem/em sizes by it.
export function applyFontSizeFactor(percent: number): void {
	if (typeof document === "undefined") return;
	document.documentElement.style.setProperty(
		"--font-size-factor",
		`${percent / 100}`,
	);
}

// Accessibility font: removes every class in the map's values, then adds the
// one mapped to `font` (none/unknown -> no class added). Keys and class names
// are consumer-defined, so a project wires its own fonts (e.g. Sylexiad).
export function applyAccessibilityFont(
	font: string,
	classMap: Readonly<Record<string, string>>,
): void {
	if (typeof document === "undefined") return;
	const el = document.documentElement;
	el.classList.remove(...Object.values(classMap));
	const cls = classMap[font];
	if (cls) el.classList.add(cls);
}

// Reduced animations: toggles the opt-in class (default `reduce-motion`).
export function applyReduceMotion(
	enabled: boolean,
	className = "reduce-motion",
): void {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle(className, enabled);
}
