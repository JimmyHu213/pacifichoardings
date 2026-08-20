// Compiled-in fallback ONLY. D1 is the source of truth for which services
// exist — the client adds and removes them from /admin/services. This array
// is a frozen snapshot used when D1 is unreachable, so during an outage a
// recently added service is missing and a recently removed one reappears.
// Keep it roughly current, but never treat it as authoritative.

import type { Service } from "../types";

export const services: Service[] = [
	{
		slug: "class-a-hoarding",
		sortOrder: 0,
		title: "Class A hoarding",
		body: "Fence-type hoarding at ground level — solid, plumb and lockable. Steel-framed ply or panel systems with dust control, sightline screening and pedestrian doors where the site needs them.",
		tagline: "Ground-level hoarding that stands straight and locks up tight.",
		overview:
			"Class A is the fence-type hoarding that separates your site from the footpath — steel-framed, ply or panel-clad, and stood plumb the first time. It carries dust screening, sightline control and pedestrian doors wherever the site needs foot traffic through, and it's built to survive the wind study, not just pass the first inspection.",
		whenYouNeedIt:
			"If your work is happening at ground level and the public needs to be kept out — demolition, excavation, ground-floor fit-out — Class A is the minimum council requirement. It's also the hoarding you'll stand first on almost every job, ahead of any Class B gantry that goes up once work moves above the footpath.",
		specs: [
			{ label: "Frame", detail: "Steel-framed panel or ply cladding, engineered to the site wind zone" },
			{ label: "Height", detail: "Standard 1.8–2.4m, engineered higher on request" },
			{ label: "Access", detail: "Lockable pedestrian and vehicle gates positioned to the site plan" },
			{ label: "Finish", detail: "Dust screening, sightline mesh or solid infill, ready for graphics" },
		],
		process: [
			{ step: "Site walk", detail: "We measure the frontage and confirm the footpath situation on-site." },
			{ step: "Drawings & permit", detail: "Engineered layout drawn, certified, and lodged with council." },
			{ step: "Install", detail: "Panels stood, braced and locked off — typically within days of permit approval." },
			{ step: "Dismantle", detail: "Struck on the program date, footpath handed back clean." },
		],
		complianceTags: ["AS 4687 certified", "SafeWork NSW compliant", "Licensed installers"],
		images: [
			{ key: null, alt: "Class A hoarding installed on site" },
			{ key: null, alt: "Class A hoarding gate and signage detail" },
		],
		faqIds: ["council-approval", "class-a-vs-class-b", "install-speed"],
	},
	{
		slug: "class-b-hoarding",
		sortOrder: 1,
		title: "Class B hoarding",
		body: "Overhead gantry protection where work happens above a footpath. Engineered decks rated to the drawings, under-awning lighting, and certification the council accepts.",
		tagline: "Overhead protection engineered for the load, not just the look.",
		overview:
			"Class B is the engineered gantry deck that goes up when work happens above a footpath you're keeping open — it catches falling material, carries under-awning lighting, and comes with the load documentation your certifier will actually accept. Every deck is drawn to the job's specific loads, not pulled off a generic template.",
		whenYouNeedIt:
			"Required wherever work is happening above a public footpath that stays trafficable — demolition above street level, facade work, crane lifts over a live footpath. As a rule of thumb NSW councils trigger a Class B deck once a building adjoining the footpath is 7.5m or taller and sits within 3.5m of the street alignment. If pedestrians are walking under the work, council will ask for a Class B deck and the engineering to back it.",
		specs: [
			{ label: "Deck", detail: "Engineered overhead deck rated to the specific load case for your job" },
			{ label: "Lighting", detail: "Under-awning lighting to the standard required for a trafficable footpath" },
			{ label: "Interface", detail: "Ties into scaffold, existing structure or ground-level Class A hoarding" },
			{ label: "Certification", detail: "Signed structural documentation your certifier can lodge immediately" },
		],
		process: [
			{ step: "Load case & drawings", detail: "Our engineers assess the works above and draw the deck to the AS/NZS 1170 load cases." },
			{ step: "Council lodgement", detail: "Structural certification and permit lodged before install." },
			{ step: "Install", detail: "Deck erected and tied in, lighting commissioned before the footpath reopens." },
			{ step: "Inspection & handover", detail: "Signed off and re-certified at six-monthly intervals while it stays up." },
		],
		complianceTags: ["AS/NZS 1170 engineered", "Engineer-signed load case", "SafeWork NSW compliant"],
		images: [
			{ key: null, alt: "Class B overhead gantry deck" },
			{ key: null, alt: "Class B under-awning lighting" },
		],
		faqIds: ["class-a-vs-class-b", "certification", "install-speed"],
	},
	{
		slug: "design-certification",
		sortOrder: 2,
		title: "Design & certification",
		body: "Every hoarding drawn and signed to AS 4687 by our engineers. Load cases, tie-downs and documentation your certifier accepts the first time.",
		tagline: "Every hoarding signed off before it's stood, not after.",
		overview:
			"Every hoarding we put up is drawn and engineered in-house to AS 4687 — load cases, tie-downs, wind ratings, and the documentation your certifier or principal contractor actually asks for. We also take on design-and-certify work for hoardings other crews are installing, where you need the engineering but already have the labour.",
		whenYouNeedIt:
			"Any hoarding on public land needs certified drawings before a council will issue a permit. If your engineer is booked out, or you need certification fast-tracked against a program date, this is a standalone service — you don't need to buy the install from us to get the paperwork.",
		specs: [
			{ label: "Scope", detail: "Load cases, tie-down details and general arrangement drawings" },
			{ label: "Standard", detail: "Designed and signed to AS 4687 by our engineers" },
			{ label: "Turnaround", detail: "Drawings issued fast enough to hold a permit deadline" },
			{ label: "Handover", detail: "Documentation supplied ready to lodge with your certifier or council" },
		],
		process: [
			{ step: "Brief", detail: "Send us the site plan and what's going up — we scope the drawings needed." },
			{ step: "Engineering", detail: "Load cases and tie-downs calculated to the site's specific conditions." },
			{ step: "Drawings issued", detail: "Signed drawings delivered ready to lodge." },
			{ step: "Support", detail: "We answer certifier or council queries on the drawings until it's approved." },
		],
		complianceTags: ["AS 4687 certified", "Engineer-signed documentation"],
		images: [
			{ key: null, alt: "Certified hoarding drawing" },
			{ key: null, alt: "Engineering sign-off on site" },
		],
		faqIds: ["certification", "class-a-vs-class-b"],
	},
];
