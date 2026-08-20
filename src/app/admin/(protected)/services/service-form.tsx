"use client";

import { useActionState } from "react";
import { createServiceAction, saveServiceAction, type ServiceFormState } from "./actions";

const initialState: ServiceFormState = { status: "idle" };

export interface ServiceFormValues {
	slug: string;
	title: string;
	tagline: string;
	body: string;
	overview: string;
	whenYouNeedIt: string;
	specs: { label: string; detail: string }[]; // exactly 4
	process: { step: string; detail: string }[]; // exactly 4
	complianceTags: string[];
	images: { key: string | null; alt: string }[]; // exactly 2
	sortOrder: number;
}

function PhotoSlot({
	label,
	fileField,
	altField,
	currentKey,
	currentAlt,
}: {
	label: string;
	fileField: string;
	altField: string;
	currentKey: string | null;
	currentAlt: string;
}) {
	return (
		<fieldset style={{ border: "1px solid var(--color-divider)", padding: 16, display: "grid", gap: 12 }}>
			<legend style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px" }}>{label}</legend>
			{currentKey ? (
				// eslint-disable-next-line @next/next/no-img-element -- R2 photos are served unoptimised by design (see /media route)
				<img src={`/media/${currentKey}`} alt={currentAlt} style={{ display: "block", maxWidth: 320, width: "100%", height: "auto" }} />
			) : (
				<p style={{ margin: 0, fontSize: 13, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>No photo yet — the site shows a placeholder frame.</p>
			)}
			<div className="field">
				<label htmlFor={`s-${fileField}`}>{currentKey ? "Replace photo" : "Upload photo"} (JPEG/PNG/WEBP/AVIF/GIF, under 5MB)</label>
				<input className="input" id={`s-${fileField}`} name={fileField} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
			</div>
			<div className="field">
				<label htmlFor={`s-${altField}`}>Photo description (for screen readers)</label>
				<input className="input" id={`s-${altField}`} name={altField} type="text" required defaultValue={currentAlt} />
			</div>
		</fieldset>
	);
}

export default function ServiceForm({ initial }: { initial?: ServiceFormValues }) {
	const isEdit = Boolean(initial);
	const [state, formAction, isPending] = useActionState(isEdit ? saveServiceAction : createServiceAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{state.status === "error" && (
				<div role="alert" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", borderLeft: "3px solid var(--color-accent-700)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					{state.message}
				</div>
			)}
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the service page shows the new content immediately.
				</div>
			)}
			<div className="field">
				<label htmlFor="s-slug">Slug {isEdit && "(fixed — it's the page URL)"}</label>
				<input
					className="input"
					id="s-slug"
					name="slug"
					type="text"
					required
					pattern="[a-z0-9]+(-[a-z0-9]+)*"
					title="Lowercase letters, numbers and hyphens"
					defaultValue={initial?.slug}
					readOnly={isEdit}
					style={isEdit ? { opacity: 0.6 } : undefined}
				/>
			</div>
			<div className="field" style={{ maxWidth: 160 }}>
				<label htmlFor="s-sort">Sort order</label>
				<input className="input" id="s-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
			</div>
			<div className="field">
				<label htmlFor="s-title">Title</label>
				<input className="input" id="s-title" name="title" type="text" required defaultValue={initial?.title} />
			</div>
			<div className="field">
				<label htmlFor="s-tagline">Tagline</label>
				<input className="input" id="s-tagline" name="tagline" type="text" required defaultValue={initial?.tagline} />
			</div>
			<div className="field">
				<label htmlFor="s-body">Card copy</label>
				<textarea className="input" id="s-body" name="body" required rows={3} defaultValue={initial?.body} />
			</div>
			<div className="field">
				<label htmlFor="s-overview">Overview</label>
				<textarea className="input" id="s-overview" name="overview" required rows={4} defaultValue={initial?.overview} />
			</div>
			<div className="field">
				<label htmlFor="s-when">When you need it</label>
				<textarea className="input" id="s-when" name="when_you_need_it" required rows={4} defaultValue={initial?.whenYouNeedIt} />
			</div>
			<fieldset style={{ border: "1px solid var(--color-divider)", padding: 16, display: "grid", gap: 16 }}>
				<legend style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px" }}>Spec cards</legend>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} style={{ display: "grid", gap: 12 }}>
						<div className="field">
							<label htmlFor={`s-spec-label-${i}`}>Spec {i + 1} label</label>
							<input className="input" id={`s-spec-label-${i}`} name={`spec_label_${i}`} type="text" required defaultValue={initial?.specs[i]?.label} />
						</div>
						<div className="field">
							<label htmlFor={`s-spec-detail-${i}`}>Spec {i + 1} detail</label>
							<textarea className="input" id={`s-spec-detail-${i}`} name={`spec_detail_${i}`} required rows={2} defaultValue={initial?.specs[i]?.detail} />
						</div>
					</div>
				))}
			</fieldset>
			<fieldset style={{ border: "1px solid var(--color-divider)", padding: 16, display: "grid", gap: 16 }}>
				<legend style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px" }}>Process steps</legend>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} style={{ display: "grid", gap: 12 }}>
						<div className="field">
							<label htmlFor={`s-process-step-${i}`}>Step {i + 1} name</label>
							<input className="input" id={`s-process-step-${i}`} name={`process_step_${i}`} type="text" required defaultValue={initial?.process[i]?.step} />
						</div>
						<div className="field">
							<label htmlFor={`s-process-detail-${i}`}>Step {i + 1} detail</label>
							<textarea className="input" id={`s-process-detail-${i}`} name={`process_detail_${i}`} required rows={2} defaultValue={initial?.process[i]?.detail} />
						</div>
					</div>
				))}
			</fieldset>
			<div className="field">
				<label htmlFor="s-compliance-tags">Compliance tags — one per line, up to 6</label>
				<textarea className="input" id="s-compliance-tags" name="compliance_tags" required rows={4} defaultValue={initial?.complianceTags.join("\n")} />
			</div>
			<PhotoSlot label="Photo 1 (top of page)" fileField="photo_0" altField="image_alt_0" currentKey={initial?.images[0]?.key ?? null} currentAlt={initial?.images[0]?.alt ?? ""} />
			<PhotoSlot label="Photo 2 (compliance section)" fileField="photo_1" altField="image_alt_1" currentKey={initial?.images[1]?.key ?? null} currentAlt={initial?.images[1]?.alt ?? ""} />
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : isEdit ? "Save service" : "Create service"}
				</button>
			</div>
		</form>
	);
}
