// Compiled-in fallbacks for the D1-backed content getters. On any D1 error
// the getters log and return these, so an outage can never blank the header,
// footer or about page. Keep values in sync with migration 0007's seeds —
// they ARE those seeds, frozen at cutover.
import type { AboutContent, CompanyInfo, ComplianceTag, Stat, Testimonial } from "./types";

export const companyInfoFallback: CompanyInfo = {
	phone: "1300 722 477",
	email: "admin@pacificgrp.com.au",
	yardSuburb: "Morisset, NSW",
	hours: "8am–4pm",
	legalName: "Pacific Hoarding Pty Ltd",
	abn: "96 686 186 934",
	coverage: "Servicing Sydney & the Central Coast",
};

export const aboutContentFallback: AboutContent = {
	headline: "One crew. One engineer. Every hoarding.",
	intro: "Pacific Hoardings designs, certifies and installs site hoardings for builders, developers and government across NSW — the same crew and the same engineer from the first site walk to the day it comes down.",
	whoHeading: "Who we are",
	whoBody: "We started as a hoarding installer and became the crew builders call when the paperwork matters as much as the panels. Every job still runs the same way — one crew stands it, one engineer signs it, and the same point of contact answers the phone from quote to dismantle.",
	compliantHeading: "Compliant is the minimum",
	compliantBody: "Anyone can stand a fence. We design and certify every hoarding to AS 4687, walk it past council before the first panel goes up, and keep it standing through the wind study, the inspection and eighteen months of the public leaning on it. Compliant is the floor we build from, not the ceiling we aim for.",
	yardBody: "Every panel and gantry goes out of the same Morisset yard, measured and staged against the site plan before the truck leaves. It's also where the paperwork gets filed — one address for the whole job.",
	crewImageKey: null,
	crewImageAlt: "Pacific Hoardings crew on site",
	yardImageKey: null,
	yardImageAlt: "Pacific Hoardings yard, Morisset",
};

export const statsFallback: Stat[] = [
	{ value: "A + B", accent: false, label: "Classes installed", detail: "Fence-type and overhead gantry" },
	{ value: "AS 4687", accent: true, label: "Certified to", detail: "Engineer-signed on every job" },
	{ value: "0", accent: true, label: "Failed inspections", detail: "Across every council we work in" },
];

export const clientsFallback: string[] = [
	"Harbourline Constructions",
	"Westgate Civil",
	"Meridian Developments",
	"Stonefield Group",
	"Axiom Build",
	"Port & Pier Projects",
	"Crestline Developers",
	"NSW Public Works",
];

export const complianceTagsFallback: ComplianceTag[] = [
	{ id: "fallback-1", label: "AS 4687 certified", accent: true },
	{ id: "fallback-2", label: "SafeWork NSW compliant", accent: false },
	{ id: "fallback-3", label: "$20M public liability", accent: false },
	{ id: "fallback-4", label: "Licensed installers", accent: false },
];

export const testimonialsFallback: Testimonial[] = [
	{
		quote:
			"“They had the Class B up over the footpath in a weekend — certified, lit, and signed off by council before we'd finished demo.”",
		source: "— Site manager, tier-one builder, Sydney",
	},
	{
		quote:
			"“Quote on Tuesday, hoarding standing Friday. The graphics wrap made the client happier than the building did.”",
		source: "— Development director, North Sydney",
	},
];
