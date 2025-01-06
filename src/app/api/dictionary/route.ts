/** @format */

import { getDictionary } from "../../../app/[lang]/dictionaries";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const lang = searchParams.get("lang") as "fr" | "en";
	const dictionary = await getDictionary(lang);
	return Response.json(dictionary);
}
