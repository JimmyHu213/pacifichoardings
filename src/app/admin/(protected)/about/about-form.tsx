"use client";

import { useActionState } from "react";
import type { AboutContent } from "@/lib/content";
import { saveAboutAction, type AboutFormState } from "./actions";

const initialState: AboutFormState = { status: "idle" };

function PhotoSlot({ label, fileField, altField, currentKey, currentAlt }: { label: string; fileField: string; altField: string; currentKey: string | null; currentAlt: string }) {
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
				<label htmlFor={`a-${fileField}`}>{currentKey ? "Replace photo" : "Upload photo"} (JPEG/PNG/WEBP/AVIF/GIF, under 5MB)</label>
				<input className="input" id={`a-${fileField}`} name={fileField} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
			</div>
			<div className="field">
				<label htmlFor={`a-${altField}`}>Photo description (for screen readers)</label>
				<input className="input" id={`a-${altField}`} name={altField} type="text" required defaultValue={currentAlt} />
			</div>
		</fieldset>
	);
}

export default function AboutForm({ initial }: { initial: AboutContent }) {
	const [state, formAction, isPending] = useActionState(saveAboutAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{state.status === "error" && (
				<div role="alert" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", borderLeft: "3px solid var(--color-accent-700)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					{state.message}
				</div>
			)}
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the about page shows the new content immediately.
				</div>
			)}
			<div className="field">
				<label htmlFor="a-headline">Headline</label>
				<input className="input" id="a-headline" name="headline" type="text" required defaultValue={initial.headline} />
			</div>
			<div className="field">
				<label htmlFor="a-intro">Intro paragraph</label>
				<textarea className="input" id="a-intro" name="intro" required rows={3} defaultValue={initial.intro} />
			</div>
			<div className="field">
				<label htmlFor="a-who-heading">First section heading</label>
				<input className="input" id="a-who-heading" name="who_heading" type="text" required defaultValue={initial.whoHeading} />
			</div>
			<div className="field">
				<label htmlFor="a-who-body">First section paragraph</label>
				<textarea className="input" id="a-who-body" name="who_body" required rows={4} defaultValue={initial.whoBody} />
			</div>
			<div className="field">
				<label htmlFor="a-compliant-heading">Second section heading</label>
				<input className="input" id="a-compliant-heading" name="compliant_heading" type="text" required defaultValue={initial.compliantHeading} />
			</div>
			<div className="field">
				<label htmlFor="a-compliant-body">Second section paragraph</label>
				<textarea className="input" id="a-compliant-body" name="compliant_body" required rows={4} defaultValue={initial.compliantBody} />
			</div>
			<div className="field">
				<label htmlFor="a-yard-body">Yard paragraph</label>
				<textarea className="input" id="a-yard-body" name="yard_body" required rows={3} defaultValue={initial.yardBody} />
			</div>
			<PhotoSlot label="Crew photo" fileField="crew_photo" altField="crew_image_alt" currentKey={initial.crewImageKey} currentAlt={initial.crewImageAlt} />
			<PhotoSlot label="Yard photo" fileField="yard_photo" altField="yard_image_alt" currentKey={initial.yardImageKey} currentAlt={initial.yardImageAlt} />
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save about page"}
				</button>
			</div>
		</form>
	);
}
