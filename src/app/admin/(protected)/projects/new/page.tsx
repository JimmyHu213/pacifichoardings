import type { Metadata } from "next";
import { services } from "@/lib/content/static/services";
import { pageGutter } from "@/lib/style-tokens";
import ProjectForm from "../project-form";

export const metadata: Metadata = { title: "New project — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				New project
			</h1>
			<ProjectForm serviceOptions={services.map((s) => ({ slug: s.slug, title: s.title }))} />
		</div>
	);
}
