import type { Project } from "../types";

export const projects: Project[] = [
	{
		id: "proj-1",
		title: "Commercial tower",
		detail: "Class B gantry, 140 lm, Sydney CBD",
		serviceSlug: "class-b-hoarding",
		timeframe: "2025 · 10-month program",
		description:
			"A 140-linear-metre Class B gantry over a live CBD footpath, engineered around three separate awning interfaces and a council-mandated pedestrian corridor. Under-awning lighting and the full load documentation were signed off before the first panel went up.",
		image: { placeholder: "Drop a photo — Class B gantry, Sydney CBD tower", label: "Commercial tower Class B gantry, Sydney CBD" },
	},
	{
		id: "proj-2",
		title: "Mixed-use development",
		detail: "Class A with full graphics wrap, Parramatta",
		serviceSlug: "class-a-hoarding",
		timeframe: "2024 · 14-month program",
		description:
			"Class A hoarding around a full city-block development site, wrapped floor-to-floor in the developer's render imagery. The wrap held up through two Parramatta storm seasons without a panel needing to come down.",
		image: {
			placeholder: "Drop a photo — Class A hoarding with graphics wrap, Parramatta",
			label: "Mixed-use development hoarding with graphics wrap, Parramatta",
		},
	},
	{
		id: "proj-3",
		title: "Civic works",
		detail: "Temporary fencing and staged hoarding, Newcastle",
		serviceSlug: "temporary-fencing",
		timeframe: "2025 · staged over 5 months",
		description:
			"Temporary fencing for site establishment, followed by a staged Class A hoarding program as the works moved block by block down the street. Each stage was permitted and installed without closing the footpath for more than a weekend.",
		image: {
			placeholder: "Drop a photo — staged hoarding program, Newcastle civic works",
			label: "Staged temporary fencing and hoarding, Newcastle",
		},
	},
	{
		id: "proj-4",
		title: "Rail corridor upgrade",
		detail: "Class A, 300 lm staged program, Western Sydney",
		serviceSlug: "class-a-hoarding",
		timeframe: "2024–25 · 11-month program",
		description:
			"300 linear metres of Class A hoarding along an active rail corridor, staged across six precincts to keep the line operating through the program. Every stage carried its own permit and traffic control plan.",
		image: {
			placeholder: "Drop a photo — Class A hoarding along rail corridor, Western Sydney",
			label: "Rail corridor upgrade hoarding, Western Sydney",
		},
	},
	{
		id: "proj-5",
		title: "Heritage facade retention",
		detail: "Class B gantry with scaffold interface, The Rocks",
		serviceSlug: "class-b-hoarding",
		timeframe: "2025 · 7-month program",
		description:
			"A Class B gantry tied directly into the scaffold protecting a retained heritage facade, drawn to interface loads the standard catalogue doesn't cover. Council and the heritage assessor both signed off the engineering before steel went up.",
		image: {
			placeholder: "Drop a photo — Class B gantry and heritage facade retention, The Rocks",
			label: "Heritage facade retention with Class B gantry, The Rocks",
		},
	},
	{
		id: "proj-6",
		title: "Shopping centre works",
		detail: "Internal hoarding with graphics wrap, Chatswood",
		serviceSlug: "class-a-hoarding",
		timeframe: "2025 · 4-month program",
		description:
			"Internal Class A hoarding through a trading centre, wrapped in leasing signage so the vacant tenancies kept selling themselves while the fit-out ran behind them. Installed and struck section by section to keep the centre trading.",
		image: {
			placeholder: "Drop a photo — internal hoarding with graphics wrap, Chatswood shopping centre",
			label: "Internal hoarding with graphics wrap, Chatswood shopping centre",
		},
	},
];
