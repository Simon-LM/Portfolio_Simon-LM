/** @format */

import { generateRSS } from "../../utils/generateRSS";

export async function GET() {
	const rss = await generateRSS();

	return new Response(rss, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "s-maxage=3600, stale-while-revalidate",
		},
	});
}
