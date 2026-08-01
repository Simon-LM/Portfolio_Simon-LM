/** @format */

// Which themes does this site ACTUALLY implement?
//
// The menu used to hard-code its list of colour-vision options, so it
// could offer a mode whose `[data-theme]` block does not exist. The user
// then presses a button and nothing visible happens — for someone with a
// colour vision deficiency that is not a missing option, it is a broken
// promise.
//
// The loaded stylesheet is the only honest answer: what it declares is
// what the site can do. No list to maintain, no build step to re-run —
// remove a theme from your SCSS and its button disappears on its own.

// Matches `[data-theme=dark]` (minified) and `[data-theme="dark"]`.
// The `=` must follow `data-theme` immediately: real stylesheets also
// contain `[data-theme^="high-contrast"]` for grouped rules, and treating
// that prefix match as a theme would invent a button for a theme that
// does not exist.
const THEME_SELECTOR = /\[data-theme=["']?([a-zA-Z0-9_-]+)["']?\]/g;

// The colour-vision themes the package knows how to name. A site is free
// to define fewer; it cannot define others without also adding labels.
export const COLOR_VISION_TYPES = [
	"protanomaly",
	"protanopia",
	"deuteranomaly",
	"deuteranopia",
	"tritanomaly",
	"tritanopia",
	"achromatopsia",
] as const;

export type ColorVisionType = (typeof COLOR_VISION_TYPES)[number];

// "auto"  -> read the loaded CSS (default)
// "all"   -> every type the package knows, whatever the CSS says
// array   -> exactly these, in this order
export type ColorVisionModesOption = "auto" | "all" | readonly string[];

function collect(rules: CSSRuleList, found: Set<string>): void {
	for (const rule of Array.from(rules)) {
		const selector = (rule as CSSStyleRule).selectorText;
		if (selector) {
			for (const match of selector.matchAll(THEME_SELECTOR)) {
				found.add(match[1]);
			}
		}
		// @media / @supports / @layer wrap their rules one level down.
		const nested = (rule as CSSGroupingRule).cssRules;
		if (nested) collect(nested, found);
	}
}

// Every theme name the loaded stylesheets declare. Empty when there is no
// document, or when nothing could be read at all.
export function detectAvailableThemes(): Set<string> {
	const found = new Set<string>();
	if (typeof document === "undefined") return found;

	for (const sheet of Array.from(document.styleSheets)) {
		try {
			collect(sheet.cssRules, found);
		} catch {
			// Reading cssRules on a cross-origin stylesheet throws. Skip it
			// rather than lose the themes the readable sheets do declare.
		}
	}
	return found;
}

// The colour-vision modes to offer, in the package's canonical order.
//
// Failure direction matters: offering a mode the site lacks is awkward,
// but hiding one it has removes a feature from the person who needs it.
// So anything unexpected falls back to showing everything.
export function resolveColorVisionModes(
	option: ColorVisionModesOption = "auto",
): readonly string[] {
	if (option === "all") return COLOR_VISION_TYPES;
	if (Array.isArray(option)) return option;

	const available = detectAvailableThemes();
	// No theme at all means detection failed (no site has zero themes),
	// not that the site defines none.
	if (available.size === 0) return COLOR_VISION_TYPES;

	// An empty result here IS meaningful: the site declares themes, just
	// no colour-vision ones. The section then has nothing to show.
	return COLOR_VISION_TYPES.filter((type) => available.has(type));
}
