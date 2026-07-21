// Content data layer — every getter is async, even the ones still reading a
// static array, so a swap to D1 doesn't touch call sites. getProjects() and
// getFaqs() made that swap in phase 10 (see .planning/PHASE10-PLAN.md);
// services/stats/testimonials/clients stay in static TS — see the plan for
// why. See .planning/DEV-PLAN.md §4 for the original design note.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { clients } from "./static/clients";
import { services } from "./static/services";
import { stats } from "./static/stats";
import { testimonials } from "./static/testimonials";
import type { Faq, Project } from "./types";

export type { Stat, Service, Project, ProjectImage, Testimonial, Faq } from "./types";

export async function getClients() {
	return clients;
}

export async function getStats() {
	return stats;
}

export async function getServices() {
	return services;
}

interface ProjectRow {
	id: number;
	title: string;
	detail: string;
	service_slug: string;
	timeframe: string;
	description: string;
	image_key: string | null;
	image_alt: string | null;
}

export async function getProjects(): Promise<Project[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare(
			"SELECT id, title, detail, service_slug, timeframe, description, image_key, image_alt FROM projects ORDER BY sort_order, id",
		).all<ProjectRow>();

		return results.map((row) => ({
			id: String(row.id),
			title: row.title,
			detail: row.detail,
			serviceSlug: row.service_slug,
			timeframe: row.timeframe,
			description: row.description,
			image: {
				placeholder: row.image_alt ?? `Drop a photo — ${row.title}`,
				label: row.image_alt ?? row.title,
				key: row.image_key,
			},
		}));
	} catch (error) {
		console.error("Failed to load projects from D1", error);
		return [];
	}
}

export async function getTestimonials() {
	return testimonials;
}

interface FaqRow {
	id: string;
	question: string;
	answer: string;
}

export async function getFaqs(): Promise<Faq[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT id, question, answer FROM faqs ORDER BY sort_order, id").all<FaqRow>();
		return results.map((row) => ({ id: row.id, q: row.question, a: row.answer }));
	} catch (error) {
		console.error("Failed to load FAQs from D1", error);
		return [];
	}
}
