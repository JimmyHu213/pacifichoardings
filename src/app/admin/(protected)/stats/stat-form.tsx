"use client";

import { useActionState } from "react";
import { useRestoreOnError } from "../use-restore-on-error";
import { saveStatAction, type StatFormState } from "./actions";

const initialState: StatFormState = { status: "idle" };

export interface StatFormValues {
	id: string;
	value: string;
	label: string;
	detail: string;
	accent: boolean;
	sortOrder: number;
}

export default function StatForm({ initial }: { initial?: StatFormValues }) {
	const [state, formAction, isPending] = useActionState(saveStatAction, initialState);
	const formRef = useRestoreOnError(state);

	return (
		<form ref={formRef} action={formAction} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
			{state.status === "error" && (
				<div
					role="alert"
					style={{
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
			<input type="hidden" name="id" value={initial?.id ?? ""} />
			<div className="field">
				<label htmlFor="f-value">Value</label>
				<input className="input" id="f-value" name="value" type="text" required defaultValue={initial?.value} />
			</div>
			<div className="field">
				<label htmlFor="f-label">Label</label>
				<input className="input" id="f-label" name="label" type="text" required defaultValue={initial?.label} />
			</div>
			<div className="field">
				<label htmlFor="f-detail">Detail</label>
				<textarea className="input" id="f-detail" name="detail" required rows={2} defaultValue={initial?.detail} />
			</div>
			<label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
				<input type="checkbox" name="accent" defaultChecked={initial?.accent} />
				Accent colour (highlights the value)
			</label>
			<div className="field" style={{ maxWidth: 160 }}>
				<label htmlFor="f-sort">Sort order</label>
				<input className="input" id="f-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
			</div>
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save stat"}
				</button>
			</div>
		</form>
	);
}
