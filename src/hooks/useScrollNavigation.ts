/** @format */

import { useCallback } from "react";
import { useRouter } from "next/navigation";

// export const useScrollNavigation = () => {
// 	const router = useRouter();

// 	const handleNavigation = useCallback(
// 		(sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
// 			e.preventDefault();

// 			// Vérifier si on est sur la page d'accueil
// 			const isHomePage = window.location.pathname.split("/").length <= 2;

// 			if (!isHomePage) {
// 				// Si on est sur une page secondaire, rediriger vers l'accueil avec l'ancre
// 				const language = window.location.pathname.split("/")[1];
// 				router.push(`/${language}/#${sectionId}`);
// 				return;
// 			}

// 			const section = document.getElementById(sectionId.replace("#", ""));

// 			if (section) {
// 				// Ajustement pour le header fixe
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

// 				// Gestion du focus
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
		[router] // Ajout de router aux dépendances
	);

	return { handleNavigation };
};
