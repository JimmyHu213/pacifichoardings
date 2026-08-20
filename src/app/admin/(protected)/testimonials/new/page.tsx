import type { Metadata } from "next";
import { pageGutter } from "@/lib/style-tokens";
import TestimonialForm from "../testimonial-form";

export const metadata: Metadata = { title: "New testimonial — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				New testimonial
			</h1>
			<TestimonialForm />
		</div>
	);
}
