/** @format */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

// export const useScrollNavigation = () => {
// 	const router = useRouter();

// 	const handleNavigation = useCallback(
// 		(sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
// 			e.preventDefault();

// 			// Check whether we're on the home page
// 			const isHomePage = window.location.pathname.split("/").length <= 2;

// 			if (!isHomePage) {
// 				// If we're on a secondary page, redirect to the home page with the anchor
// 				const language = window.location.pathname.split("/")[1];
// 				router.push(`/${language}/#${sectionId}`);
// 				return;
// 			}

// 			const section = document.getElementById(sectionId.replace("#", ""));

// 			if (section) {
// 				// Adjustment for the fixed header
// 				const headerHeight =
// 					document.querySelector("header")?.offsetHeight || 0;
// 				const y =
// 					section.getBoundingClientRect().top +
// 					window.pageYOffset -
// 					headerHeight;

// 				// Scroll
// 				window.scrollTo({
// 					top: y,
// 					behavior: "smooth",
// 				});

// 				// Focus handling
// 				requestAnimationFrame(() => {
// 					section.setAttribute("tabindex", "-1");
// 					section.focus({ preventScroll: true });

// 					requestAnimationFrame(() => {
// 						section.removeAttribute("tabindex");
// 					});
// 				});
// 			}
// 		},
// 		[]
// 	);

// 	return { handleNavigation };
// };

export const useScrollNavigation = () => {
	const router = useRouter();

	const handleNavigation = useCallback(
		(sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();

			const isHomePage = window.location.pathname.split("/").length <= 2;

			if (!isHomePage) {
				const language = window.location.pathname.split("/")[1];
				router.push(`/${language}/#${sectionId}`);
				return;
			}

			const section = document.getElementById(sectionId.replace("#", ""));

			if (section) {
				const headerHeight =
					document.querySelector("header")?.offsetHeight || 0;
				const y =
					section.getBoundingClientRect().top +
					window.pageYOffset -
					headerHeight;

				window.scrollTo({
					top: y,
					behavior: "smooth",
				});

				requestAnimationFrame(() => {
					section.setAttribute("tabindex", "-1");
					section.focus({ preventScroll: true });

					requestAnimationFrame(() => {
						section.removeAttribute("tabindex");
					});
				});
			}
		},
		[router] // router added to the dependencies
	);

	return { handleNavigation };
};
