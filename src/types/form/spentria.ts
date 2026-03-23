/** @format */

export interface SpentriaRequestBody {
	message: string;
	context: string;
	email: string;
	sender_ip?: string;
	allowed_languages?: string[];
	commercial_policy?: "permissive" | "moderate" | "restrictive";
	subject?: string;
	firstname?: string;
	lastname?: string;
	phone?: string;
	custom_fields?: Record<string, string>;
}

export interface SpentriaTag {
	name: string;
	confidence: number;
}

export interface SpentriaTags {
	matched: SpentriaTag[];
	filtered: SpentriaTag[];
	total_tags: number;
	tag_status: "ok" | "no_match" | "error" | "invalid_json" | "no_tags";
}

export interface SpentriaResponse {
	request_id: string;
	result: "fit" | "borderline" | "spam";
	reason: string | null;
	context: string;
	commercial_policy: string;
	tags?: SpentriaTags;
}

export interface SpentriaErrorResponse {
	status: "error";
	code: string;
	message: string;
	field?: string;
}
