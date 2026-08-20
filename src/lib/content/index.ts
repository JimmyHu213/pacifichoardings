// Content data layer — every getter is async, even the ones still reading a
// static array, so a swap to D1 doesn't touch call sites. getProjects() and
// getFaqs() made that swap in phase 10 (see .planning/PHASE10-PLAN.md);
// services stay in static TS — see the plan for why. See .planning/DEV-PLAN.md §4
// for the original design note.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { services } from "./static/services";
import {
	aboutContentFallback,
	clientsFallback,
	companyInfoFallback,
	complianceTagsFallback,
	statsFallback,
	testimonialsFallback,
} from "./fallbacks";
import type { AboutContent, CompanyInfo, ComplianceTag, Faq, Project, Stat, Testimonial } from "./types";

export type { Stat, Service, Project, ProjectImage, Testimonial, Faq, CompanyInfo, AboutContent, ComplianceTag } from "./types";

// Settings reads are prefix-scoped so company and about fetches stay cheap.
async function getSiteSettings(prefix: string): Promise<Map<string, string>> {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT key, value FROM site_settings WHERE key LIKE ?")
		.bind(`${prefix}.%`)
		.all<{ key: string; value: string }>();
	return new Map(results.map((row) => [row.key, row.value]));
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
	try {
		const s = await getSiteSettings("company");
		return {
			phone: s.get("company.phone") ?? companyInfoFallback.phone,
			email: s.get("company.email") ?? companyInfoFallback.email,
			yardSuburb: s.get("company.yard_suburb") ?? companyInfoFallback.yardSuburb,
			hours: s.get("company.hours") ?? companyInfoFallback.hours,
			legalName: s.get("company.legal_name") ?? companyInfoFallback.legalName,
			abn: s.get("company.abn") ?? companyInfoFallback.abn,
			coverage: s.get("company.coverage") ?? companyInfoFallback.coverage,
		};
	} catch (error) {
		console.error("Failed to load company info from D1", error);
		return companyInfoFallback;
	}
}

export async function getAboutContent(): Promise<AboutContent> {
	try {
		const s = await getSiteSettings("about");
		return {
			headline: s.get("about.headline") ?? aboutContentFallback.headline,
			intro: s.get("about.intro") ?? aboutContentFallback.intro,
			whoHeading: s.get("about.who_heading") ?? aboutContentFallback.whoHeading,
			whoBody: s.get("about.who_body") ?? aboutContentFallback.whoBody,
			compliantHeading: s.get("about.compliant_heading") ?? aboutContentFallback.compliantHeading,
			compliantBody: s.get("about.compliant_body") ?? aboutContentFallback.compliantBody,
			yardBody: s.get("about.yard_body") ?? aboutContentFallback.yardBody,
			crewImageKey: s.get("about.crew_image") ?? null,
			crewImageAlt: s.get("about.crew_image_alt") ?? aboutContentFallback.crewImageAlt,
			yardImageKey: s.get("about.yard_image") ?? null,
			yardImageAlt: s.get("about.yard_image_alt") ?? aboutContentFallback.yardImageAlt,
		};
	} catch (error) {
		console.error("Failed to load about content from D1", error);
		return aboutContentFallback;
	}
}

export async function getStats(): Promise<Stat[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT value, label, detail, accent FROM stats ORDER BY sort_order, id").all<{
			value: string;
			label: string;
			detail: string;
			accent: number;
		}>();
		return results.map((row) => ({ value: row.value, label: row.label, detail: row.detail, accent: row.accent === 1 }));
	} catch (error) {
		console.error("Failed to load stats from D1", error);
		return statsFallback;
	}
}

export async function getClients(): Promise<string[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT name FROM clients ORDER BY sort_order, id").all<{ name: string }>();
		return results.map((row) => row.name);
	} catch (error) {
		console.error("Failed to load clients from D1", error);
		return clientsFallback;
	}
}

export async function getComplianceTags(): Promise<ComplianceTag[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT id, label, accent FROM compliance_tags ORDER BY sort_order, id").all<{
			id: number;
			label: string;
			accent: number;
		}>();
		return results.map((row) => ({ id: String(row.id), label: row.label, accent: row.accent === 1 }));
	} catch (error) {
		console.error("Failed to load compliance tags from D1", error);
		return complianceTagsFallback;
	}
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
	image_width: number | null;
	image_height: number | null;
}

export async function getProjects(): Promise<Project[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare(
			"SELECT id, title, detail, service_slug, timeframe, description, image_key, image_alt, image_width, image_height FROM projects ORDER BY sort_order, id",
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
				width: row.image_width,
				height: row.image_height,
			},
		}));
	} catch (error) {
		console.error("Failed to load projects from D1", error);
		return [];
	}
}

export async function getTestimonials(): Promise<Testimonial[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT quote, source FROM testimonials ORDER BY sort_order, id").all<{
			quote: string;
			source: string;
		}>();
		return results.map((row) => ({ quote: row.quote, source: row.source }));
	} catch (error) {
		console.error("Failed to load testimonials from D1", error);
		return testimonialsFallback;
	}
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
