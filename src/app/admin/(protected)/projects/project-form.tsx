"use client";

import { useActionState } from "react";
import { saveProjectAction, type ProjectFormState } from "./actions";

const initialState: ProjectFormState = { status: "idle" };

export interface ProjectFormValues {
	id?: string;
	title: string;
	slug: string;
	detail: string;
	serviceSlug: string;
	timeframe: string;
	description: string;
	imageKey: string | null;
	imageAlt: string;
	sortOrder: number;
}

export default function ProjectForm({
	initial,
	serviceOptions,
}: {
	initial?: ProjectFormValues;
	serviceOptions: { slug: string; title: string }[];
}) {
	const [state, formAction, isPending] = useActionState(saveProjectAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, maxWidth: 760 }}>
			{state.status === "error" && (
				<div
					role="alert"
					style={{
						gridColumn: "1 / -1",
						padding: "12px 14px",
						border: "1px solid var(--color-divider)",
						borderLeft: "3px solid var(--color-accent-700)",
						background: "var(--color-surface)",
						fontSize: 13,
						lineHeight: "20px",
					}}
				>
					{state.message}
				</div>
			)}
			{initial?.id && <input type="hidden" name="id" value={initial.id} />}
			<div className="field">
				<label htmlFor="p-title">Title</label>
				<input className="input" id="p-title" name="title" type="text" required defaultValue={initial?.title} />
			</div>
			<div className="field">
				<label htmlFor="p-slug">Slug</label>
				<input
					className="input"
					id="p-slug"
					name="slug"
					type="text"
					required
					pattern="[a-z0-9]+(-[a-z0-9]+)*"
					title="Lowercase letters, numbers and hyphens"
					defaultValue={initial?.slug}
				/>
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="p-detail">Detail line (home marquee caption)</label>
				<input className="input" id="p-detail" name="detail" type="text" required defaultValue={initial?.detail} />
			</div>
			<div className="field">
				<label htmlFor="p-service">Service</label>
				<select className="input" id="p-service" name="service_slug" required defaultValue={initial?.serviceSlug ?? ""}>
					<option value="" disabled>
						Pick a service…
					</option>
					{serviceOptions.map((service) => (
						<option key={service.slug} value={service.slug}>
							{service.title}
						</option>
					))}
				</select>
			</div>
			<div className="field">
				<label htmlFor="p-timeframe">Timeframe</label>
				<input className="input" id="p-timeframe" name="timeframe" type="text" required placeholder="e.g. 2025, 14 months" defaultValue={initial?.timeframe} />
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="p-description">Description</label>
				<textarea className="input" id="p-description" name="description" required rows={4} defaultValue={initial?.description} />
			</div>
			<div className="field">
				<label htmlFor="p-image">{initial?.imageKey ? "Replace photo" : "Photo"}</label>
				<input className="input" id="p-image" name="image" type="file" accept="image/*" />
				{initial?.imageKey && (
					<span style={{ display: "block", fontSize: 12, marginTop: 6, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
						Current: {initial.imageKey}
					</span>
				)}
			</div>
			<div className="field">
				<label htmlFor="p-image-alt">Photo alt text</label>
				<input className="input" id="p-image-alt" name="image_alt" type="text" defaultValue={initial?.imageAlt} />
			</div>
			<div className="field">
				<label htmlFor="p-sort">Sort order</label>
				<input className="input" id="p-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
			</div>
			<div style={{ gridColumn: "1 / -1" }}>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save project"}
				</button>
			</div>
		</form>
	);
}
