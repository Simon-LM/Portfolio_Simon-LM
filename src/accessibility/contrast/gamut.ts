/** @format */

// A compiled color value is "out of the sRGB gamut" when Sass serialized it
// with a component outside its valid range: an hsl()/hsla() whose saturation
// or lightness percentage falls outside [0,100], or an rgb()/rgba() whose
// red/green/blue channel falls outside [0,255]. This happens when an OKLCH
// operation (e.g. `color.mix(..., $method: oklch)` between two far-apart
// hues) yields a color outside sRGB. Browsers — and culori on parse — CLAMP
// such values silently, so the *rendered* color differs from what the engine
// computed. culori-based `inGamut()` therefore can't detect it (it reports
// the already-clamped value as in-gamut); this raw-string check can, at build
// time. Hex and named colors are representable only in-gamut, so they pass.

const EPSILON = 1e-4;

// Separators are `,` or whitespace or `/` (legacy and modern CSS forms).
const HSL_RE = /^hsla?\(\s*[^,\s/]+[,\s/]+([\d.]+)%[,\s/]+([\d.]+)%/i;
const RGB_RE = /^rgba?\(\s*([\d.]+)[,\s/]+([\d.]+)[,\s/]+([\d.]+)/i;

// Returns a human-readable reason if `value` is an out-of-gamut serialization,
// or null if it is in-gamut (or not a recognized numeric color form).
export function outOfGamutReason(value: string): string | null {
	const v = value.trim();

	const hsl = HSL_RE.exec(v);
	if (hsl) {
		const s = Number(hsl[1]);
		const l = Number(hsl[2]);
		if (s > 100 + EPSILON || s < -EPSILON || l > 100 + EPSILON || l < -EPSILON) {
			return `hsl() saturation/lightness outside [0,100]: s=${s}%, l=${l}%`;
		}
		return null;
	}

	const rgb = RGB_RE.exec(v);
	if (rgb) {
		for (const raw of [rgb[1], rgb[2], rgb[3]]) {
			const c = Number(raw);
			if (c > 255 + EPSILON || c < -EPSILON) {
				return `rgb() channel outside [0,255]: ${c}`;
			}
		}
		return null;
	}

	return null;
}

export type GamutWaiver = {
	/** Theme block the out-of-gamut declaration lives in. */
	theme: string;
	/** Custom property name. */
	prop: string;
	reason: string;
	/** true = already out of gamut when the guard was introduced. */
	preexisting: boolean;
};

// Known out-of-gamut declarations, waived like the contrast/distinguishability
// waivers — with the same anti-zombie rule: once a declaration returns
// in-gamut, its waiver here is obsolete and the guard test forces its removal.
//
// Currently empty: the only out-of-gamut declarations at introduction (11 in
// `tritanomaly`, from the part-1 amber→orange severity-0.5 OKLCH blend) were
// resolved in PLAN-refonte-daltonienne.md part 3 phase 3 — the severity blend
// is now gamut-mapped (chroma reduction, `gamut-map-srgb` in _theme-utils.scss),
// so the guard passes with zero waivers. Any future out-of-gamut value must be
// fixed at the source or, if genuinely intentional, waived here with a reason.
export const gamutWaivers: readonly GamutWaiver[] = [];
