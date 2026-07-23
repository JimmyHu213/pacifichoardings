import type { Service } from "../types";

export const services: Service[] = [
	{
		slug: "class-a-hoarding",
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
			{ placeholder: "Drop a photo — Class A hoarding on a live site", label: "Class A hoarding installed on site" },
			{ placeholder: "Drop a photo — pedestrian gate and signage detail", label: "Class A hoarding gate and signage detail" },
		],
		faqIds: ["council-approval", "class-a-vs-class-b", "install-speed"],
	},
	{
		slug: "class-b-hoarding",
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
			{ placeholder: "Drop a photo — Class B gantry over a live footpath", label: "Class B overhead gantry deck" },
			{ placeholder: "Drop a photo — under-awning lighting detail", label: "Class B under-awning lighting" },
		],
		faqIds: ["class-a-vs-class-b", "certification", "install-speed"],
	},
	{
		slug: "temporary-fencing",
		title: "Temporary fencing",
		body: "Chain-mesh panels, braced, counterweighted and stood the same day. For the stages before the hoarding goes up and after it comes down.",
		tagline: "Chain-mesh that's braced and standing before lunch.",
		overview:
			"Temporary fencing is the chain-mesh panel system we stand for the stages a full hoarding doesn't suit — site establishment before the hoarding goes up, or the wind-down once it comes off. Braced, counterweighted and stood the same day, it's rated for wind and secure enough to hold a site overnight.",
		whenYouNeedIt:
			"Use it for early works and site establishment, short-duration jobs where a built hoarding isn't justified, or as the interim boundary while your Class A or Class B permit is still moving through council.",
		specs: [
			{ label: "Panels", detail: "Standard 2.1m x 2.4m chain-mesh, hot-dip galvanised" },
			{ label: "Bracing", detail: "Counterweighted feet rated to the site wind zone" },
			{ label: "Access", detail: "Swing or sliding gate panels wherever the site needs them" },
			{ label: "Options", detail: "Shade cloth, privacy screen or anti-climb infill on request" },
		],
		process: [
			{ step: "Site walk", detail: "We measure the boundary and confirm ground conditions." },
			{ step: "Delivery", detail: "Panels delivered and staged the same or next business day." },
			{ step: "Install", detail: "Braced and locked off — usually done within a single visit." },
			{ step: "Strike", detail: "Pulled down and removed the day the site no longer needs it." },
		],
		complianceTags: ["SafeWork NSW compliant", "Licensed installers"],
		images: [
			{ placeholder: "Drop a photo — temporary fencing around a site perimeter", label: "Temporary chain-mesh fencing" },
			{ placeholder: "Drop a photo — braced fencing detail", label: "Temporary fencing bracing detail" },
		],
		faqIds: ["install-speed", "council-approval"],
	},
	{
		slug: "signage-graphics-wraps",
		title: "Signage & graphics wraps",
		body: "Full-print wraps, project signage and anti-graffiti laminate. The safest wall on the street may as well sell the building behind it.",
		tagline: "The safest wall on the street, doing double duty as a billboard.",
		overview:
			"Full-print graphics wraps turn your hoarding into project signage — render imagery, sponsor logos or straight branding, printed and laminated to survive eighteen months of weather and foot traffic. Anti-graffiti laminate and statutory signage go on every wrap as standard, not as an upsell.",
		whenYouNeedIt:
			"Any hoarding facing a street, laneway or public plaza is free marketing space — developers and builders use it for render imagery and leasing signage, retail fit-outs use it to keep the shopfront looking finished during works, and every site needs the statutory safety and contact signage regardless.",
		specs: [
			{ label: "Print", detail: "Full-colour UV-cured print, panel or full-length wrap" },
			{ label: "Laminate", detail: "Anti-graffiti laminate on every wrap as standard" },
			{ label: "Artwork", detail: "Supply your own or have our studio lay it out to the panel dimensions" },
			{ label: "Signage", detail: "Statutory site signage included — hazard, contact and permit signage" },
		],
		process: [
			{ step: "Artwork", detail: "You supply artwork or brief our studio on what the wrap needs to say." },
			{ step: "Proof", detail: "Panel-by-panel proof signed off before anything goes to print." },
			{ step: "Print & laminate", detail: "Printed, laminated and cut to the exact hoarding panel sizes." },
			{ step: "Install", detail: "Applied on site, flush and bubble-free, ready for the street to see." },
		],
		complianceTags: ["Anti-graffiti laminate", "Statutory signage included"],
		images: [
			{ placeholder: "Drop a photo — full graphics wrap on a hoarding", label: "Hoarding graphics wrap installed" },
			{ placeholder: "Drop a photo — signage detail close-up", label: "Signage and laminate detail" },
		],
		faqIds: ["branding-print"],
	},
	{
		slug: "design-certification",
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
			{ placeholder: "Drop a photo — engineering drawing or site plan", label: "Certified hoarding drawing" },
			{ placeholder: "Drop a photo — engineer reviewing drawings on site", label: "Engineering sign-off on site" },
		],
		faqIds: ["certification", "class-a-vs-class-b"],
	},
	{
		slug: "council-permits",
		title: "Council permits",
		body: "We draw it, certify it and lodge it — hoarding permits, footpath occupation and traffic control plans. You build; we handle the paperwork.",
		tagline: "We draw it, certify it, lodge it — you keep building.",
		overview:
			"Hoarding permits, footpath occupation approvals and traffic control plans — we handle the whole council pathway so your program doesn't stall waiting on paperwork. Drawings, certification and the application itself are prepared and lodged by us, with a single point of contact if the council comes back with questions.",
		whenYouNeedIt:
			"Any hoarding standing on or over public land — a footpath, road reserve or laneway — needs a council permit before it goes up. If you're managing the permit yourself and it's holding up your start date, this is where we take it off your plate.",
		specs: [
			{ label: "Scope", detail: "Hoarding permit, footpath occupation and traffic control plan applications" },
			{ label: "Council liaison", detail: "We lodge and respond to council queries directly" },
			{ label: "Documentation", detail: "Certified drawings and insurance certificates included with the application" },
			{ label: "Timeline", detail: "Lodged as soon as drawings are signed — no waiting on us to start the clock" },
		],
		process: [
			{ step: "Site assessment", detail: "We confirm what approvals your specific footpath and site need." },
			{ step: "Application prepared", detail: "Drawings, certification and forms assembled for lodgement." },
			{ step: "Lodged with council", detail: "Application submitted and tracked until approved." },
			{ step: "Approval handed over", detail: "You get the permit; we're ready to install the day it clears." },
		],
		complianceTags: ["Council-ready documentation", "AS 4687 certified"],
		images: [
			{ placeholder: "Drop a photo — hoarding permit or approval documentation", label: "Council permit documentation" },
			{ placeholder: "Drop a photo — hoarding on a public footpath", label: "Permitted hoarding on public footpath" },
		],
		faqIds: ["council-approval"],
	},
];
