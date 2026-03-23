/** @format */

import { useState, useEffect } from "react";

export const useCursorNavigation = () => {
	const [isCursorNavigationEnabled, setCursorNavigationEnabled] =
		useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "F7") {
				setCursorNavigationEnabled((prev) => !prev);
				event.preventDefault();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return isCursorNavigationEnabled;
};
