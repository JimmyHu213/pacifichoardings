// Compiled-in fallbacks for the D1-backed content getters. On any D1 error
// the getters log and return these, so an outage can never blank the header,
// footer or about page. Keep values in sync with migration 0007's seeds —
// they ARE those seeds, frozen at cutover.
import type { AboutContent, CompanyInfo, ComplianceContent, ComplianceTag, Stat, Testimonial } from "./types";

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
	yardBody: "Every panel and gantry goes out of the same Morisset yard, measured and staged against the site plan before the truck leaves. It’s also where the paperwork gets filed — one address for the whole job.",
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

// Compliance content fallback synced with migration 0010's seeds.
export const complianceContentFallback: ComplianceContent = {
	headline: "Compliant is the minimum",
	intro: "Every hoarding we put up is designed, certified and permitted before the first panel goes up. This is what that actually means — the standard we build to, the approvals council asks for, and what lands in your inbox when the job's done.",
	standardsBody: "Class A fencing and hoardings are built to AS 4687, the Australian Standard for temporary fencing and hoardings. Class B overhead decks are a different animal — they're engineered to AS/NZS 1170 load cases under the SafeWork NSW Overhead Protective Structures Code of Practice. Either way, the engineering is done from the first drawing, not retrofitted with paperwork once the structure's already standing.",
	standardsCards: [
		{ label: "Drawings", detail: "General arrangement drawings for the specific site and hoarding type" },
		{ label: "Load cases", detail: "Wind, live and dead loads calculated for the site's actual conditions" },
		{ label: "Tie-downs", detail: "Footing and tie-down details engineered to the ground conditions on site" },
		{ label: "Sign-off", detail: "Signed and stamped by our structural engineer before the permit is lodged" },
	],
	permitsBody: "Any hoarding standing on or over public land — a footpath, road reserve or laneway — needs council consent under section 138 of the Roads Act 1993 before it goes up. Three approvals usually travel together: the hoarding permit itself, footpath occupation where the hoarding or gantry extends over council land, and a traffic control plan wherever pedestrians or vehicles need to be managed around it. We prepare and lodge all three, and stay the point of contact if council comes back with questions.",
	safeworkBody: "Every install runs under a Safe Work Method Statement to SafeWork NSW's requirements, and every installer on our crew holds the licence the job calls for — high-risk construction work licensing included. That's not a certificate kept in a drawer; it's what the crew is actually working to on site.",
	insuranceBody: "We carry $20M public liability cover on every job, and can supply a certificate of currency before you need one — for your principal contractor agreement, your PC's file, or your own insurer.",
	handoverBody: "Every job hands back the same paper trail — nothing you have to chase after the crew's left site.",
	handoverCards: [
		{ label: "Engineering drawings", detail: "Signed general arrangement and load case drawings" },
		{ label: "Permit approvals", detail: "Copies of the hoarding, footpath and traffic control approvals" },
		{ label: "Insurance certificate", detail: "Certificate of currency for our $20M public liability cover" },
		{ label: "Compliance sign-off", detail: "Written confirmation the install matches the certified drawings" },
	],
	permitImageKey: null,
	permitImageAlt: "Approved hoarding permit signage on site",
	crewImageKey: null,
	crewImageAlt: "Pacific Hoardings crew on site in full PPE",
};
