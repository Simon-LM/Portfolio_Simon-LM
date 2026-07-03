/** @jest-environment node */
/** @format */

import fs from "node:fs";

import { generateReport, REPORT_PATH } from "../report";

describe("CONTRAST-REPORT.md freshness", () => {
	it("matches what generateReport() produces for the same generation date", () => {
		const committed = fs.readFileSync(REPORT_PATH, "utf8");

		const dateMatch = committed.match(/Generated on: (\d{4}-\d{2}-\d{2})/);
		if (!dateMatch) {
			throw new Error(
				"report.test.ts: couldn't find the 'Generated on: YYYY-MM-DD' " +
					"line in the committed CONTRAST-REPORT.md",
			);
		}

		const regenerated = generateReport(dateMatch[1]);

		expect(regenerated).toBe(committed);
	});
});
