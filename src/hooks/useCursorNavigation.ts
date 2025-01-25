/** @format */

// import { useState, useEffect } from "react";

// export const useCursorNavigation = () => {
// 	const [isCursorNavigationEnabled, setCursorNavigationEnabled] =
// 		useState(false);

// 	useEffect(() => {
// 		const handleKeyDown = (event: KeyboardEvent) => {
// 			if (event.key === "F7") {
// 				setCursorNavigationEnabled((prev) => !prev);
// 				event.preventDefault();
// 			}
// 		};

// 		window.addEventListener("keydown", handleKeyDown);
// 		return () => window.removeEventListener("keydown", handleKeyDown);
// 	}, []);

// 	return isCursorNavigationEnabled;
// };

import { useState, useEffect } from "react";
import { useConsentStore } from "../app/[lang]/sections/Contact/hooks/useConsentState";

export const useCursorNavigation = () => {
	const [isCursorNavigationEnabled, setCursorNavigationEnabled] =
		useState(false);
	const hasConsent = useConsentStore((state) => state.hasConsent);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isInForm = (event.target as HTMLElement)?.closest("form");

			if (isInForm && !hasConsent) {
				event.preventDefault();
				return;
			}

			if (event.key === "F7") {
				setCursorNavigationEnabled((prev) => !prev);
				event.preventDefault();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [hasConsent]);

	return isCursorNavigationEnabled;
};
