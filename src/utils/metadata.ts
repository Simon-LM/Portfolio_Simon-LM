/** @format */

import { Metadata } from "../types/common/metadata";

export const generateMetadata = (langue: string): Metadata => {
	const currentDate = new Date();
	return {
		date: currentDate.toLocaleDateString("fr-FR"),
		heure: currentDate.toLocaleTimeString("fr-FR"),
		langue: langue || "fr",
	};
};
