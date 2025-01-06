/** @format */

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Comment in English: Exclude static files
// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl;

// 	// Comment in English: Check if path starts with /en or /fr
// 	const pathnameHasLocale = /^\/(?:en|fr)(?:\/|$)/.test(pathname);

// 	if (!pathnameHasLocale) {
// 		// Comment in English: Force redirect to "en"
// 		return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
// 	}

// 	return NextResponse.next();
// }

// // // // // // // // // // // //
// // // // // // // // // // // //

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Comment in English: Define supported locales
// const LOCALES = ["en", "fr"] as const;
// const defaultLocale = "en";

// export const config = {
// 	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/"],
// };

// export function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl;

// 	// Comment in English: Check if path starts with /en or /fr
// 	const pathnameHasLocale = LOCALES.some(
// 		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
// 	);

// 	if (!pathnameHasLocale) {
// 		// Comment in English: Force redirect to defaultLocale
// 		return NextResponse.redirect(
// 			new URL(
// 				`/${defaultLocale}${pathname === "/" ? "" : pathname}`,
// 				request.url
// 			)
// 		);
// 	}

// 	return NextResponse.next();
// }

// // // // // // // // // // // // //
// // // // // // // // // // // // //

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Comment in English: Define supported locales
// const LOCALES = ["en", "fr"] as const;
// const defaultLocale = "en";

// export const config = {
// 	// Comment in English: Match all paths including root
// 	matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl;

// 	// Comment in English: Handle root path explicitly
// 	if (pathname === "/") {
// 		return NextResponse.redirect(new URL("/en", request.url));
// 	}

// 	// Comment in English: Check for locale in other paths
// 	const pathnameHasLocale = LOCALES.some(
// 		(locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
// 	);

// 	if (!pathnameHasLocale) {
// 		return NextResponse.redirect(
// 			new URL(`/${defaultLocale}${pathname}`, request.url)
// 		);
// 	}

// 	return NextResponse.next();
// }

// // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // //

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Récupérer la langue sauvegardée
	const savedLanguage = request.cookies.get("language-storage")?.value;
	const language = savedLanguage
		? JSON.parse(savedLanguage).state.language
		: null;

	// Rediriger vers la langue sauvegardée ou détecter la langue du navigateur
	if (request.nextUrl.pathname === "/") {
		const browserLanguage = request.headers
			.get("accept-language")
			?.split(",")[0]
			.split("-")[0];
		const defaultLanguage =
			language || (browserLanguage === "fr" ? "fr" : "en");

		return NextResponse.redirect(new URL(`/${defaultLanguage}`, request.url));
	}

	// Rediriger la page privacy-policy
	if (request.nextUrl.pathname === "/privacy-policy") {
		const defaultLanguage = language || "fr";
		return NextResponse.redirect(
			new URL(`/${defaultLanguage}/privacy-policy`, request.url)
		);
	}

	return NextResponse.next();
}

// Configuration des routes à intercepter
export const config = {
	matcher: ["/", "/privacy-policy"],
};
