"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServices } from "@/lib/content";

export interface QuoteFormValues {
	name: string;
	company: string;
	email: string;
	phone: string;
	site: string;
	type: string;
	details: string;
}

// React 19 resets uncontrolled form fields on every action submission,
// success or error (github.com/facebook/react/issues/31649) — `attempt`
// lets the form force a remount with defaultValue set from `values` so a
// rejected submission doesn't wipe what the user typed.
export type QuoteFormState =
	| { status: "idle"; attempt: number }
	| { status: "success"; attempt: number }
	| { status: "error"; message: string; attempt: number; values: QuoteFormValues };

// Matches the fallback <option> text in quote-form.tsx exactly (the <select>
// has no explicit value= attrs, so the option value is its text content).
const NOT_SURE_OPTION = "Not sure yet — advise me";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function submitQuote(prevState: QuoteFormState, formData: FormData): Promise<QuoteFormState> {
	const attempt = prevState.attempt + 1;
	const values: QuoteFormValues = {
		name: field(formData, "name", 200),
		company: field(formData, "company", 200),
		email: field(formData, "email", 320),
		phone: field(formData, "phone", 40),
		site: field(formData, "site", 300),
		type: field(formData, "type", 60),
		details: field(formData, "details", 4000),
	};

	if (!values.name) {
		return { status: "error", message: "Add your name so we know who to call.", attempt, values };
	}
	if (!values.email || !EMAIL_PATTERN.test(values.email)) {
		return { status: "error", message: "Add a valid email address.", attempt, values };
	}
	if (!values.site) {
		return { status: "error", message: "Add the site address or suburb.", attempt, values };
	}

	const serviceTitles = (await getServices()).map((s) => s.title);
	const need = serviceTitles.includes(values.type) || values.type === NOT_SURE_OPTION ? values.type : null;

	try {
		// Sync mode is rejected by OpenNext whenever the calling route could be
		// static (every page this form renders on is) — async mode is required.
		// https://github.com/opennextjs/opennextjs-cloudflare/issues/575
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare(
			`INSERT INTO quote_submissions (name, company, email, phone, site_address, need, details, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				values.name,
				values.company || null,
				values.email,
				values.phone || null,
				values.site,
				need,
				values.details || null,
				new Date().toISOString(),
			)
			.run();
	} catch (error) {
		console.error("Quote submission failed", error);
		return {
			status: "error",
			message: "Something went wrong on our end — call us instead, we're not going anywhere.",
			attempt,
			values,
		};
	}

	return { status: "success", attempt };
}
