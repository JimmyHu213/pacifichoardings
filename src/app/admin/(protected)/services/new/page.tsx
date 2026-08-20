import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { pageGutter } from "@/lib/style-tokens";
import ServiceForm from "../service-form";

export const metadata: Metadata = { title: "New service — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
	const services = await getServices();
	const defaultSortOrder = services.length ? Math.max(...services.map((s) => s.sortOrder)) + 1 : 0;

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 8px" }}>
				New service
			</h1>
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				The slug becomes the page address (/services/your-slug) and can&rsquo;t be changed afterwards. Photos are added on the next screen once the service exists.
			</p>
			<ServiceForm defaultSortOrder={defaultSortOrder} />
		</div>
	);
}
