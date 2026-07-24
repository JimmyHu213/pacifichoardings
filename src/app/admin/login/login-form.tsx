"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = { status: "idle" };

// Minimal typing for the slice of the Turnstile API we call. The script is
// loaded below; `render=explicit` means it does nothing until we call render().
interface TurnstileApi {
	render: (
		el: HTMLElement,
		options: { sitekey: string; theme?: "auto" | "light" | "dark"; "error-callback"?: () => void },
	) => string;
	reset: (widgetId?: string) => void;
	remove: (widgetId?: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

export default function LoginForm({ siteKey }: { siteKey: string }) {
	const [state, formAction, isPending] = useActionState(loginAction, initialState);
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	// Seed from an already-present script (client-side nav back to the login
	// page), where next/script's onLoad won't fire again.
	const [scriptReady, setScriptReady] = useState(() => typeof window !== "undefined" && !!window.turnstile);

	// Explicitly render the widget once both the script and the container are
	// ready. Guarded against React's double-invoke so we never mount twice.
	useEffect(() => {
		if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
		widgetIdRef.current = window.turnstile.render(containerRef.current, { sitekey: siteKey, theme: "auto" });
		return () => {
			if (widgetIdRef.current && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
				widgetIdRef.current = null;
			}
		};
	}, [scriptReady, siteKey]);

	// A Turnstile token is single-use and dies once the server verifies it, so
	// after any completed submission (e.g. a wrong-password retry) reset the
	// widget to mint a fresh token for the next attempt.
	const wasPending = useRef(false);
	useEffect(() => {
		if (wasPending.current && !isPending && widgetIdRef.current && window.turnstile) {
			window.turnstile.reset(widgetIdRef.current);
		}
		wasPending.current = isPending;
	}, [isPending]);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16 }}>
			{siteKey && (
				<Script
					src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
					strategy="afterInteractive"
					onLoad={() => setScriptReady(true)}
				/>
			)}
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
			<div ref={containerRef} />
			<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={isPending}>
				{isPending ? "Checking…" : "Log in"}
			</button>
		</form>
	);
}
