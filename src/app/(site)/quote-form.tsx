"use client";

import { useActionState } from "react";
import { submitQuote, type QuoteFormState } from "./quote-actions";

const initialState: QuoteFormState = { status: "idle", attempt: 0 };

export default function QuoteForm({ phone, serviceTitles }: { phone: string; serviceTitles: string[] }) {
	const [state, formAction, isPending] = useActionState(submitQuote, initialState);
	const values = state.status === "error" ? state.values : undefined;

	if (state.status === "success") {
		return (
			<div>
				<h3 style={{ fontSize: 22, lineHeight: "24px", letterSpacing: "0.02em", textTransform: "uppercase", margin: 0 }}>
					Received — we&rsquo;re on it
				</h3>
				<p style={{ fontSize: 15, lineHeight: "24px", margin: "12px 0 0", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
					One of our estimators will call you to book the site walk, and your itemised quote will follow the visit.
				</p>
				<p style={{ fontSize: 13, lineHeight: "24px", margin: "16px 0 0", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
					In a hurry? Call <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> now.
				</p>
			</div>
		);
	}

	return (
		// Keyed on attempt: React 19 resets uncontrolled fields on every action
		// submission, so on error this forces a remount that reapplies
		// defaultValue from what was just submitted instead of leaving it blank.
		<form
			key={state.attempt}
			action={formAction}
			style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}
		>
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
						color: "var(--color-text)",
					}}
				>
					{state.message}
				</div>
			)}
			<div className="field">
				<label htmlFor="q-name">Name</label>
				<input className="input" id="q-name" name="name" type="text" required autoComplete="name" defaultValue={values?.name} />
			</div>
			<div className="field">
				<label htmlFor="q-company">Company</label>
				<input className="input" id="q-company" name="company" type="text" defaultValue={values?.company} />
			</div>
			<div className="field">
				<label htmlFor="q-email">Email</label>
				<input className="input" id="q-email" name="email" type="email" required autoComplete="email" defaultValue={values?.email} />
			</div>
			<div className="field">
				<label htmlFor="q-phone">Phone</label>
				<input className="input" id="q-phone" name="phone" type="tel" autoComplete="tel" defaultValue={values?.phone} />
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="q-site">Site address or suburb</label>
				<input className="input" id="q-site" name="site" type="text" required defaultValue={values?.site} />
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="q-type">What do you need?</label>
				<select className="input" id="q-type" name="type" defaultValue={values?.type}>
					{serviceTitles.map((title) => (
						<option key={title}>{title}</option>
					))}
					<option>Not sure yet — advise me</option>
				</select>
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="q-details">Project details</label>
				<textarea
					className="input"
					id="q-details"
					name="details"
					placeholder="Frontage length, footpath situation, program dates — whatever you know."
					defaultValue={values?.details}
				/>
			</div>
			<div style={{ gridColumn: "1 / -1" }}>
				<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={isPending}>
					{isPending ? "Sending…" : "Request a quote"}
				</button>
			</div>
		</form>
	);
}
