/** @format */

// "use client";

// import { usePathname, useSearchParams } from "next/navigation";
// import { useEffect, useState, Suspense } from "react";
// import Script from "next/script";

// type MatomoCommandArray = Array<string | string[] | Record<string, unknown>>;

// // Component that uses useSearchParams
// function MatomoPageTracker() {
// 	const pathname = usePathname();
// 	const searchParams = useSearchParams();
// 	const [isMounted, setIsMounted] = useState(false);

// 	// Wait for the component to be mounted client-side
// 	useEffect(() => {
// 		setIsMounted(true);
// 	}, []);

// 	// Initial Matomo configuration
// 	useEffect(() => {
// 		if (!isMounted) return;

// 		// Check that _paq is defined
// 		window._paq = window._paq || [];

// 		// Base configuration
// 		window._paq.push(["disableCookies"]);
// 		window._paq.push(["setTrackerUrl", "//analytics.lostintab.com/matomo.php"]);
// 		window._paq.push(["setSiteId", "1"]);
// 		window._paq.push(["enableLinkTracking"]);

// 		// First trackPageView
// 		window._paq.push(["trackPageView"]);
// 	}, [isMounted]);

// 	// Track page changes
// 	useEffect(() => {
// 		if (!isMounted || typeof window === "undefined" || !window._paq) return;

// 		// Rebuild the full URL for Matomo
// 		const url =
// 			pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

// 		// Notify Matomo of the page change
// 		window._paq.push(["setCustomUrl", url]);
// 		window._paq.push(["setDocumentTitle", document.title]);
// 		window._paq.push(["trackPageView"]);
// 	}, [pathname, searchParams, isMounted]);

// 	return null;
// }

// // Main component that wraps the tracker in a Suspense
// export default function MatomoAnalytics() {
// 	return (
// 		<>
// 			<Suspense fallback={null}>
// 				<MatomoPageTracker />
// 			</Suspense>
// 			<Script
// 				id="matomo-script"
// 				strategy="afterInteractive"
// 				src="//analytics.lostintab.com/matomo.js"
// 			/>
// 		</>
// 	);
// }

// declare global {
// 	interface Window {
// 		_paq: MatomoCommandArray;
// 	}
// }

// // // // // // // // // // // // // //

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import Script from "next/script";

type MatomoCommandArray = Array<string | string[] | Record<string, unknown>>;

// Component that uses useSearchParams
function MatomoPageTracker({ scriptLoaded }: { scriptLoaded: boolean }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Initialize _paq command queue on mount (no setState — only external side-effect)
	useEffect(() => {
		window._paq = window._paq || [];
		window._paq.push(["disableCookies"]);
		window._paq.push(["setTrackerUrl", "//analytics.lostintab.com/matomo.php"]);
		window._paq.push(["setSiteId", "1"]);
		window._paq.push(["enableLinkTracking"]);
	}, []);

	// Track page changes — effects run in declaration order, so _paq is always ready
	useEffect(() => {
		if (!scriptLoaded || typeof window === "undefined" || !window._paq) return;

		const url =
			pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

		window._paq.push(["setCustomUrl", url]);
		window._paq.push(["setDocumentTitle", document.title]);
		window._paq.push(["trackPageView"]);
	}, [pathname, searchParams, scriptLoaded]);

	return null;
}

// Main component that wraps the tracker in a Suspense
export default function MatomoAnalytics() {
	const [scriptLoaded, setScriptLoaded] = useState(false);

	return (
		<>
			{/* Pre-initialize _paq queue before the main Matomo script loads */}
			<Script
				id="matomo-init"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            window._paq = window._paq || [];
            window._paq.push(["disableCookies"]);
            window._paq.push(["setTrackerUrl", "//analytics.lostintab.com/matomo.php"]);
            window._paq.push(["setSiteId", "1"]);
            window._paq.push(["enableLinkTracking"]);
          `,
				}}
			/>

			{/* Then load the Matomo script */}
			<Script
				id="matomo-script"
				strategy="afterInteractive"
				src="//analytics.lostintab.com/matomo.js"
				onLoad={() => setScriptLoaded(true)}
			/>

			{/* Tracker for page changes */}
			<Suspense fallback={null}>
				{scriptLoaded && <MatomoPageTracker scriptLoaded={scriptLoaded} />}
			</Suspense>
		</>
	);
}

declare global {
	interface Window {
		_paq: MatomoCommandArray;
	}
}
