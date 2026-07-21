export interface Stat {
	value: string;
	accent: boolean;
	label: string;
	detail: string;
}

export interface Service {
	title: string;
	body: string;
}

export interface Project {
	id: string;
	title: string;
	detail: string;
}

export interface Testimonial {
	quote: string;
	source: string;
}

export interface Faq {
	q: string;
	a: string;
}
