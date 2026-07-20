"use client";

import { useState, type FormEvent } from "react";

export default function QuoteForm() {
	const [submitted, setSubmitted] = useState(false);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitted(true);
	}

	if (submitted) {
		return (
			<div>
				<h3 style={{ fontSize: 22, lineHeight: "24px", letterSpacing: "0.02em", textTransform: "uppercase", margin: 0 }}>
					Received — we&rsquo;re on it
				</h3>
				<p style={{ fontSize: 15, lineHeight: "24px", margin: "12px 0 0", color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}>
					One of our estimators will call you to book the site walk. Expect your itemised quote within 24 hours of the visit.
				</p>
				<p style={{ fontSize: 13, lineHeight: "24px", margin: "16px 0 0", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
					In a hurry? Call <a href="tel:1300000000">1300 000 000</a> now.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
			<div className="field">
				<label htmlFor="q-name">Name</label>
				<input className="input" id="q-name" name="name" type="text" required autoComplete="name" />
			</div>
			<div className="field">
				<label htmlFor="q-company">Company</label>
				<input className="input" id="q-company" name="company" type="text" />
			</div>
			<div className="field">
				<label htmlFor="q-email">Email</label>
				<input className="input" id="q-email" name="email" type="email" required autoComplete="email" />
			</div>
			<div className="field">
				<label htmlFor="q-phone">Phone</label>
				<input className="input" id="q-phone" name="phone" type="tel" autoComplete="tel" />
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="q-site">Site address or suburb</label>
				<input className="input" id="q-site" name="site" type="text" required />
			</div>
			<div className="field" style={{ gridColumn: "1 / -1" }}>
				<label htmlFor="q-type">What do you need?</label>
				<select className="input" id="q-type" name="type">
					<option>Class A hoarding</option>
					<option>Class B hoarding (gantry)</option>
					<option>Temporary fencing</option>
					<option>Signage / graphics wrap</option>
					<option>Design &amp; certification only</option>
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
				/>
			</div>
			<div style={{ gridColumn: "1 / -1" }}>
				<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }}>
					Request a quote
				</button>
			</div>
		</form>
	);
}
