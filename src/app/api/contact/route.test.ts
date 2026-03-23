/** @format */

// Mock next/server before importing route
jest.mock("next/server", () => {
	class MockNextRequest {
		private _body: string;
		private _headers: Map<string, string>;
		method: string;

		constructor(url: string, init?: RequestInit) {
			this._body = (init?.body as string) || "";
			this._headers = new Map<string, string>();
			this.method = init?.method || "GET";
			if (init?.headers) {
				const entries =
					init.headers instanceof Headers
						? Array.from(init.headers.entries())
						: Object.entries(init.headers as Record<string, string>);
				for (const [key, value] of entries) {
					this._headers.set(key.toLowerCase(), value);
				}
			}
		}

		get headers() {
			const headers = this._headers;
			return {
				get: (name: string) => headers.get(name.toLowerCase()) || null,
			};
		}

		async json() {
			return JSON.parse(this._body);
		}
	}

	return {
		NextRequest: MockNextRequest,
		NextResponse: {
			json: (body: unknown, init?: { status?: number }) => ({
				status: init?.status || 200,
				json: async () => body,
			}),
		},
	};
});

import { POST } from "./route";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
	jest.resetAllMocks();
	process.env = {
		...originalEnv,
		NEXT_PUBLIC_EMAILJS_SERVICE_ID: "test_service",
		NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "test_template",
		NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "test_key",
		SPENTRIA_API_KEY: "test_spentria_key",
		SPENTRIA_API_URL: "https://spentria.test/api/v1/analyze/contact",
	};
});

afterEach(() => {
	process.env = originalEnv;
});

const validFormData = {
	firstName: "Jean",
	lastName: "Dupont",
	email: "jean@example.com",
	phone: "06 12 34 56 78",
	company: "Acme",
	subject: "Test subject",
	message: "This is a test message for the contact form.",
	gdprConsent: true,
	honeypot: "",
	date: "2026-03-22",
	heure: "10:00",
	lang: "fr",
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NextRequest } = require("next/server");

function createRequest(
	body: Record<string, unknown>,
	headers?: Record<string, string>
) {
	return new NextRequest("http://localhost/api/contact", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		body: JSON.stringify(body),
	});
}

function mockSpentriaResponse(
	result: "fit" | "borderline" | "spam",
	reason: string | null = null,
	tags?: { matched: { name: string; confidence: number }[] }
) {
	return {
		ok: true,
		json: async () => ({
			request_id: "test-uuid",
			result,
			reason,
			context: "test",
			commercial_policy: "moderate",
			...(tags && {
				tags: {
					matched: tags.matched,
					filtered: [],
					total_tags: tags.matched.length,
					tag_status: "ok",
				},
			}),
		}),
	};
}

function mockEmailJSResponse(ok = true) {
	return {
		ok,
		text: async () => (ok ? "OK" : "EmailJS Error"),
		headers: new Headers(),
	};
}

describe("POST /api/contact", () => {
	describe("Spentria result: fit", () => {
		it("sends email normally and returns success", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(mockFetch).toHaveBeenCalledTimes(2);

			// Verify EmailJS call has PORTFOLIO || prefix
			const emailCall = mockFetch.mock.calls[1];
			const emailBody = JSON.parse(emailCall[1].body);
			expect(emailBody.template_params.subject).toBe("PORTFOLIO || Test subject");
			expect(emailBody.template_params.message).not.toContain("[Spentria]");
		});

		it("appends Spentria tags to subject when present", async () => {
			mockFetch
				.mockResolvedValueOnce(
					mockSpentriaResponse("fit", null, {
						matched: [{ name: "devis", confidence: 0.92 }],
					})
				)
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);

			const emailCall = mockFetch.mock.calls[1];
			const emailBody = JSON.parse(emailCall[1].body);
			expect(emailBody.template_params.subject).toBe(
				"PORTFOLIO || Test subject #devis"
			);
		});
	});

	describe("Spentria result: borderline", () => {
		it("sends email with [Borderline_PortfolioSimonLM] tag and AI reason in spentria_info", async () => {
			mockFetch
				.mockResolvedValueOnce(
					mockSpentriaResponse(
						"borderline",
						"Borderline: unsolicited commercial offer"
					)
				)
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);

			const emailCall = mockFetch.mock.calls[1];
			const emailBody = JSON.parse(emailCall[1].body);
			expect(emailBody.template_params.subject).toBe(
				"[Borderline_PortfolioSimonLM] Test subject"
			);
			expect(emailBody.template_params.message).not.toContain("[Spentria]");
			expect(emailBody.template_params.spentria_info).toContain(
				"[Spentria] Raison : Borderline: unsolicited commercial offer"
			);
		});
	});

	describe("Spentria result: spam", () => {
		it("returns fake success and does NOT send email", async () => {
			mockFetch.mockResolvedValueOnce(mockSpentriaResponse("spam", "Obvious spam"));

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(data.message).toBe("Email sent successfully");
			// Only 1 fetch call (Spentria), no EmailJS call, no spam log (env not set)
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("forwards spam log to personal server with correct payload", async () => {
			process.env.SPAM_LOG_ENDPOINT = "https://db.lostintab.com/api/v1/logs/spam";
			process.env.SPAM_LOG_TOKEN = "test-token";

			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("spam", "SEO spam"))
				.mockResolvedValueOnce({ ok: true });

			await POST(
				createRequest(validFormData, {
					"x-forwarded-for": "1.2.3.4",
				})
			);

			const logCall = mockFetch.mock.calls[1];
			expect(logCall[0]).toBe("https://db.lostintab.com/api/v1/logs/spam");

			const logHeaders = logCall[1].headers;
			expect(logHeaders.Authorization).toBe("Bearer test-token");

			const logBody = JSON.parse(logCall[1].body);
			expect(logBody.source).toBe("portfolio");
			expect(logBody.type).toBe("spam");
			expect(logBody.timestamp).toBeDefined();
			expect(logBody.spentria_request_id).toBe("test-uuid");
			expect(logBody.spentria_reason).toBe("SEO spam");
			expect(logBody.visitor_email).toBe(validFormData.email);
			expect(logBody.visitor_ip).toBe("1.2.3.4");
			expect(logBody.message_subject).toBe(validFormData.subject);
			expect(logBody.message_body).toBe(validFormData.message);
		});

		it("skips spam log when SPAM_LOG_ENDPOINT is missing", async () => {
			delete process.env.SPAM_LOG_ENDPOINT;
			delete process.env.SPAM_LOG_TOKEN;

			mockFetch.mockResolvedValueOnce(mockSpentriaResponse("spam", "Spam"));

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			// Only 1 fetch call (Spentria), no spam log
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("Fail-open: Spentria unavailable", () => {
		it("sends email normally when Spentria API returns error", async () => {
			mockFetch
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					text: async () => "Internal Server Error",
				})
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it("sends email normally when Spentria times out", async () => {
			mockFetch
				.mockRejectedValueOnce(
					Object.assign(new Error("Aborted"), { name: "AbortError" })
				)
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it("sends email normally on chain_exhausted", async () => {
			mockFetch
				.mockResolvedValueOnce(
					mockSpentriaResponse("borderline", "chain_exhausted")
				)
				.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);

			// Verify email is sent with PORTFOLIO || prefix but WITHOUT borderline tag (fail-open)
			const emailCall = mockFetch.mock.calls[1];
			const emailBody = JSON.parse(emailCall[1].body);
			expect(emailBody.template_params.subject).toBe("[Non vérifié] PORTFOLIO || Test subject");
		});
	});

	describe("Fail-open: missing Spentria config", () => {
		it("sends email normally when SPENTRIA_API_KEY is missing", async () => {
			delete process.env.SPENTRIA_API_KEY;
			mockFetch.mockResolvedValueOnce(mockEmailJSResponse());

			const response = await POST(createRequest(validFormData));
			const data = await response.json();

			expect(data.success).toBe(true);
			// Only 1 fetch call (EmailJS), Spentria was skipped
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("Honeypot", () => {
		it("returns fake success without calling any API when honeypot is filled", async () => {
			const response = await POST(
				createRequest({ ...validFormData, honeypot: "bot-filled-this" })
			);
			const data = await response.json();

			expect(data.success).toBe(true);
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe("Visitor IP extraction", () => {
		it("extracts IP from x-forwarded-for header", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse());

			await POST(
				createRequest(validFormData, {
					"x-forwarded-for": "92.67.89.10, 10.0.0.1",
				})
			);

			const spentriaCall = mockFetch.mock.calls[0];
			const spentriaBody = JSON.parse(spentriaCall[1].body);
			expect(spentriaBody.sender_ip).toBe("92.67.89.10");
		});

		it("extracts IP from x-real-ip header when x-forwarded-for is absent", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse());

			await POST(
				createRequest(validFormData, { "x-real-ip": "185.12.34.56" })
			);

			const spentriaCall = mockFetch.mock.calls[0];
			const spentriaBody = JSON.parse(spentriaCall[1].body);
			expect(spentriaBody.sender_ip).toBe("185.12.34.56");
		});
	});

	describe("Spentria request body", () => {
		it("sends correct fields to Spentria API", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse());

			await POST(createRequest(validFormData));

			const spentriaCall = mockFetch.mock.calls[0];
			const spentriaBody = JSON.parse(spentriaCall[1].body);

			expect(spentriaBody.message).toBe(validFormData.message);
			expect(spentriaBody.email).toBe(validFormData.email);
			expect(spentriaBody.subject).toBe(validFormData.subject);
			expect(spentriaBody.firstname).toBe(validFormData.firstName);
			expect(spentriaBody.lastname).toBe(validFormData.lastName);
			expect(spentriaBody.phone).toBe(validFormData.phone);
			expect(spentriaBody.allowed_languages).toEqual(["fr", "en"]);
			expect(spentriaBody.commercial_policy).toBe("moderate");
			expect(spentriaBody.custom_fields).toEqual({ company: "Acme" });
			expect(spentriaBody.context).toContain("accessibility");
		});

		it("omits custom_fields when company is empty", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse());

			await POST(createRequest({ ...validFormData, company: "" }));

			const spentriaCall = mockFetch.mock.calls[0];
			const spentriaBody = JSON.parse(spentriaCall[1].body);
			expect(spentriaBody.custom_fields).toBeUndefined();
		});
	});

	describe("Error handling", () => {
		it("returns 400 for invalid JSON body", async () => {
			const req = new NextRequest("http://localhost/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "invalid json{{{",
			});

			const response = await POST(req);
			expect(response.status).toBe(400);
		});

		it("returns 500 when EmailJS fails", async () => {
			mockFetch
				.mockResolvedValueOnce(mockSpentriaResponse("fit"))
				.mockResolvedValueOnce(mockEmailJSResponse(false));

			const response = await POST(createRequest(validFormData));
			expect(response.status).toBe(500);
		});

		it("returns 500 when EmailJS config is missing", async () => {
			delete process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
			mockFetch.mockResolvedValueOnce(mockSpentriaResponse("fit"));

			const response = await POST(createRequest(validFormData));
			expect(response.status).toBe(500);
		});
	});
});
