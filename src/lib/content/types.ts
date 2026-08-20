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

export interface ServiceImageSlot {
	/** R2 key served via /media; null renders the placeholder frame. */
	key: string | null;
	alt: string;
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
	images: ServiceImageSlot[];
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
	slug: string;
	title: string;
	detail: string;
	serviceSlug: string;
	timeframe: string;
	description: string;
	/** First gallery photo, or a placeholder-frame shape when the project has none. */
	cover: ProjectImage;
	/** All gallery photos in sort order — every entry has a non-null key. */
	images: ProjectImage[];
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

export interface CompanyInfo {
	phone: string;
	email: string;
	yardSuburb: string;
	hours: string;
	legalName: string;
	abn: string;
	coverage: string;
}

export interface AboutContent {
	headline: string;
	intro: string;
	whoHeading: string;
	whoBody: string;
	compliantHeading: string;
	compliantBody: string;
	yardBody: string;
	/** R2 key served via /media; null renders the placeholder frame. */
	crewImageKey: string | null;
	crewImageAlt: string;
	yardImageKey: string | null;
	yardImageAlt: string;
}

export interface ComplianceTag {
	id: string;
	label: string;
	accent: boolean;
}
