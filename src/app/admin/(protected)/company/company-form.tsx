"use client";

import { useActionState } from "react";
import type { CompanyInfo } from "@/lib/content";
import { saveCompanyAction, type CompanyFormState } from "./actions";

const initialState: CompanyFormState = { status: "idle" };

const FIELDS: { name: string; label: string; value: (c: CompanyInfo) => string }[] = [
	{ name: "phone", label: "Phone", value: (c) => c.phone },
	{ name: "email", label: "Email", value: (c) => c.email },
	{ name: "yard_suburb", label: "Yard suburb", value: (c) => c.yardSuburb },
	{ name: "hours", label: "Hours", value: (c) => c.hours },
	{ name: "legal_name", label: "Legal name", value: (c) => c.legalName },
	{ name: "abn", label: "ABN", value: (c) => c.abn },
	{ name: "coverage", label: "Coverage line", value: (c) => c.coverage },
];

export default function CompanyForm({ initial }: { initial: CompanyInfo }) {
	const [state, formAction, isPending] = useActionState(saveCompanyAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
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
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the site shows the new details immediately.
				</div>
			)}
			{FIELDS.map((f) => (
				<div className="field" key={f.name}>
					<label htmlFor={`c-${f.name}`}>{f.label}</label>
					<input className="input" id={`c-${f.name}`} name={f.name} type="text" required defaultValue={f.value(initial)} />
				</div>
			))}
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save company info"}
				</button>
			</div>
		</form>
	);
}
