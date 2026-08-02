export interface Stat {
	value: string;
	accent: boolean;
	label: string;
	detail: string;
}

export interface ServiceSpec {
	label: string;
	detail: string;
}

export interface ServiceProcessStep {
	step: string;
	detail: string;
}

export interface ServiceImage {
	placeholder: string;
	label: string;
}

export interface Service {
	slug: string;
	title: string;
	body: string;
	tagline: string;
	overview: string;
	whenYouNeedIt: string;
	specs: ServiceSpec[];
	process: ServiceProcessStep[];
	complianceTags: string[];
	images: ServiceImage[];
	faqIds: string[];
}

export interface ProjectImage {
	placeholder: string;
	label: string;
	/** R2 object key served via /media once a real photo is uploaded; null keeps the placeholder. */
	key: string | null;
	/** Real pixel size, so the photo can render at its own aspect ratio. Null falls back to 4:3. */
	width: number | null;
	height: number | null;
}

export interface Project {
	id: string;
	title: string;
	detail: string;
	serviceSlug: string;
	timeframe: string;
	description: string;
	image: ProjectImage;
}

export interface Testimonial {
	quote: string;
	source: string;
}

export interface Faq {
	id: string;
	q: string;
	a: string;
}
