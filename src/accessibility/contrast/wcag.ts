/** @format */

import { rgb as toRgbMode, wcagContrast } from "culori";

export type ContrastLevel = "text" | "large-text" | "non-text";

// WCAG 2.2 SC 1.4.3 (text) and 1.4.11 (non-text UI components) thresholds.
const THRESHOLDS: Record<ContrastLevel, number> = {
	text: 4.5,
	"large-text": 3.0,
	"non-text": 3.0,
};

export function thresholdFor(level: ContrastLevel): number {
	return THRESHOLDS[level];
}

export type RgbColor = {
	mode: "rgb";
	r: number;
	g: number;
	b: number;
	alpha?: number;
};

// Parses any CSS color string (hex, rgb()/rgba(), hsl(), named) into an RGB
// color. Throws instead of silently falling back to a default color, since a
// bad value here would otherwise report a fake, meaningless ratio.
export function toRgb(value: string): RgbColor {
	const parsed = toRgbMode(value);
	if (!parsed) {
		throw new Error(`toRgb: "${value}" is not a valid CSS color`);
	}
	return parsed;
}

// Standard "source-over" alpha compositing in sRGB, per channel:
// c = a·c_fg + (1−a)·c_bg. Assumes bg is fully opaque.
export function compositeOver(fg: RgbColor, bg: RgbColor): RgbColor {
	const a = fg.alpha ?? 1;
	if (a >= 1) {
		return { mode: "rgb", r: fg.r, g: fg.g, b: fg.b };
	}
	return {
		mode: "rgb",
		r: a * fg.r + (1 - a) * bg.r,
		g: a * fg.g + (1 - a) * bg.g,
		b: a * fg.b + (1 - a) * bg.b,
	};
}

// WCAG 2.x contrast ratio between two opaque colors: relative luminance,
// (L1+0.05)/(L2+0.05). Delegates to culori's implementation — compose alpha
// with compositeOver() first if either color isn't opaque.
export function contrastRatio(fg: RgbColor, bg: RgbColor): number {
	return wcagContrast(fg, bg);
}
