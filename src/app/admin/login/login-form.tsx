"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { status: "idle" };

export default function LoginForm() {
	const [state, formAction, isPending] = useActionState(loginAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16 }}>
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
						color: "var(--color-text)",
					}}
				>
					{state.message}
				</div>
			)}
			<div className="field">
				<label htmlFor="admin-password">Password</label>
				<input className="input" id="admin-password" name="password" type="password" required autoComplete="current-password" autoFocus />
			</div>
			<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={isPending}>
				{isPending ? "Checking…" : "Log in"}
			</button>
		</form>
	);
}
