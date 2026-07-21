// Content data layer — every getter is async, even though it reads a static
// array today, so a later swap to D1/KV reads doesn't touch call sites.
// See .planning/DEV-PLAN.md §4.
import { clients } from "./static/clients";
import { faqs } from "./static/faqs";
import { projects } from "./static/projects";
import { services } from "./static/services";
import { stats } from "./static/stats";
import { testimonials } from "./static/testimonials";

export type { Stat, Service, Project, Testimonial, Faq } from "./types";

export async function getClients() {
	return clients;
}

export async function getStats() {
	return stats;
}

export async function getServices() {
	return services;
}

export async function getProjects() {
	return projects;
}

export async function getTestimonials() {
	return testimonials;
}

export async function getFaqs() {
	return faqs;
}
