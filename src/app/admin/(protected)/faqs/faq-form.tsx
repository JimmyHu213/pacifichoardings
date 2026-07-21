"use client";

import { useActionState } from "react";
import { saveFaqAction, type FaqFormState } from "./actions";

const initialState: FaqFormState = { status: "idle" };

export interface FaqFormValues {
	id: string;
	question: string;
	answer: string;
	sortOrder: number;
}

export default function FaqForm({ initial }: { initial?: FaqFormValues }) {
	const [state, formAction, isPending] = useActionState(saveFaqAction, initialState);
	const isEdit = Boolean(initial);

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
			<input type="hidden" name="is_edit" value={String(isEdit)} />
			<div className="field">
				<label htmlFor="f-id">Id {isEdit && "(fixed — service pages reference it)"}</label>
				<input
					className="input"
					id="f-id"
					name="id"
					type="text"
					required
					pattern="[a-z0-9]+(-[a-z0-9]+)*"
					title="Lowercase letters, numbers and hyphens"
					defaultValue={initial?.id}
					readOnly={isEdit}
					style={isEdit ? { opacity: 0.6 } : undefined}
				/>
			</div>
			<div className="field">
				<label htmlFor="f-question">Question</label>
				<input className="input" id="f-question" name="question" type="text" required defaultValue={initial?.question} />
			</div>
			<div className="field">
				<label htmlFor="f-answer">Answer</label>
				<textarea className="input" id="f-answer" name="answer" required rows={5} defaultValue={initial?.answer} />
			</div>
			<div className="field" style={{ maxWidth: 160 }}>
				<label htmlFor="f-sort">Sort order</label>
				<input className="input" id="f-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
			</div>
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save FAQ"}
				</button>
			</div>
		</form>
	);
}
