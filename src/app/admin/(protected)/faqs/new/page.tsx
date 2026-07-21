import type { Metadata } from "next";
import { pageGutter } from "@/lib/style-tokens";
import FaqForm from "../faq-form";

export const metadata: Metadata = { title: "New FAQ — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default function NewFaqPage() {
	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				New FAQ
			</h1>
			<FaqForm />
		</div>
	);
}
