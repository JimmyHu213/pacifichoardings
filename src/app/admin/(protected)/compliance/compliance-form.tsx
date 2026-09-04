"use client";

import { useActionState } from "react";
import { useRestoreOnError } from "../use-restore-on-error";
import type { ComplianceContent } from "@/lib/content";
import { saveComplianceAction, type ComplianceFormState } from "./actions";

const initialState: ComplianceFormState = { status: "idle" };

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
				<label htmlFor={`c-${fileField}`}>{currentKey ? "Replace photo" : "Upload photo"} (JPEG/PNG/WEBP/AVIF/GIF, under 5MB)</label>
				<input className="input" id={`c-${fileField}`} name={fileField} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
			</div>
			<div className="field">
				<label htmlFor={`c-${altField}`}>Photo description (for screen readers)</label>
				<input className="input" id={`c-${altField}`} name={altField} type="text" required defaultValue={currentAlt} />
			</div>
		</fieldset>
	);
}

function CardGroupFieldset({ legend, prefix, cards }: { legend: string; prefix: string; cards: { label: string; detail: string }[] }) {
	return (
		<fieldset style={{ border: "1px solid var(--color-divider)", padding: 16, display: "grid", gap: 16 }}>
			<legend style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px" }}>{legend}</legend>
			{cards.map((card, i) => (
				<div key={i} style={{ display: "grid", gap: 12 }}>
					<div className="field">
						<label htmlFor={`c-${prefix}-label-${i}`}>Card {i + 1} label</label>
						<input className="input" id={`c-${prefix}-label-${i}`} name={`${prefix}_label_${i}`} type="text" required defaultValue={card.label} />
					</div>
					<div className="field">
						<label htmlFor={`c-${prefix}-detail-${i}`}>Card {i + 1} detail</label>
						<textarea className="input" id={`c-${prefix}-detail-${i}`} name={`${prefix}_detail_${i}`} required rows={2} defaultValue={card.detail} />
					</div>
				</div>
			))}
		</fieldset>
	);
}

export default function ComplianceForm({ initial }: { initial: ComplianceContent }) {
	const [state, formAction, isPending] = useActionState(saveComplianceAction, initialState);
	const formRef = useRestoreOnError(state);

	return (
		<form ref={formRef} action={formAction} style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{state.status === "error" && (
				<div role="alert" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", borderLeft: "3px solid var(--color-accent-700)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					{state.message}
				</div>
			)}
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the compliance page shows the new content immediately.
				</div>
			)}
			<div className="field">
				<label htmlFor="c-headline">Headline</label>
				<input className="input" id="c-headline" name="headline" type="text" required defaultValue={initial.headline} />
			</div>
			<div className="field">
				<label htmlFor="c-intro">Intro paragraph</label>
				<textarea className="input" id="c-intro" name="intro" required rows={3} defaultValue={initial.intro} />
			</div>
			<div className="field">
				<label htmlFor="c-standards-body">Standards paragraph</label>
				<textarea className="input" id="c-standards-body" name="standards_body" required rows={4} defaultValue={initial.standardsBody} />
			</div>
			<CardGroupFieldset legend="Standards cards" prefix="standards" cards={initial.standardsCards} />
			<div className="field">
				<label htmlFor="c-permits-body">Permits paragraph</label>
				<textarea className="input" id="c-permits-body" name="permits_body" required rows={4} defaultValue={initial.permitsBody} />
			</div>
			<div className="field">
				<label htmlFor="c-safework-body">Safework paragraph</label>
				<textarea className="input" id="c-safework-body" name="safework_body" required rows={3} defaultValue={initial.safeworkBody} />
			</div>
			<div className="field">
				<label htmlFor="c-insurance-body">Insurance paragraph</label>
				<textarea className="input" id="c-insurance-body" name="insurance_body" required rows={3} defaultValue={initial.insuranceBody} />
			</div>
			<div className="field">
				<label htmlFor="c-handover-body">Handover paragraph</label>
				<textarea className="input" id="c-handover-body" name="handover_body" required rows={2} defaultValue={initial.handoverBody} />
			</div>
			<CardGroupFieldset legend="Handover cards" prefix="handover" cards={initial.handoverCards} />
			<PhotoSlot label="Permits photo" fileField="permit_photo" altField="permit_image_alt" currentKey={initial.permitImageKey} currentAlt={initial.permitImageAlt} />
			<PhotoSlot label="Crew photo" fileField="crew_photo" altField="crew_image_alt" currentKey={initial.crewImageKey} currentAlt={initial.crewImageAlt} />
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save compliance page"}
				</button>
			</div>
		</form>
	);
}
