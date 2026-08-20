"use client";

import { useActionState } from "react";
import { saveTestimonialAction, type TestimonialFormState } from "./actions";

const initialState: TestimonialFormState = { status: "idle" };

export interface TestimonialFormValues {
	id: string;
	quote: string;
	source: string;
	sortOrder: number;
}

export default function TestimonialForm({ initial }: { initial?: TestimonialFormValues }) {
	const [state, formAction, isPending] = useActionState(saveTestimonialAction, initialState);

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
			<input type="hidden" name="id" value={initial?.id ?? ""} />
			<div className="field">
				<label htmlFor="f-quote">Quote</label>
				<textarea className="input" id="f-quote" name="quote" required rows={4} defaultValue={initial?.quote} />
			</div>
			<div className="field">
				<label htmlFor="f-source">Source</label>
				<input className="input" id="f-source" name="source" type="text" required defaultValue={initial?.source} />
			</div>
			<div className="field" style={{ maxWidth: 160 }}>
				<label htmlFor="f-sort">Sort order</label>
				<input className="input" id="f-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
			</div>
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save testimonial"}
				</button>
			</div>
		</form>
	);
}
