import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { pageGutter } from "@/lib/style-tokens";
import ProjectForm from "../project-form";

export const metadata: Metadata = { title: "New project — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
	const services = await getServices();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				New project
			</h1>
			<ProjectForm serviceOptions={services.map((s) => ({ slug: s.slug, title: s.title }))} />
		</div>
	);
}
