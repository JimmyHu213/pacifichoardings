"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState, type CSSProperties } from "react";
import {
	loginAction,
	requestOtpAction,
	verifyOtpAction,
	type LoginState,
	type OtpRequestState,
	type OtpVerifyState,
} from "../actions";

const initialLogin: LoginState = { status: "idle" };
const initialRequest: OtpRequestState = { status: "idle" };
const initialVerify: OtpVerifyState = { status: "idle" };

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

type Mode = "email" | "code" | "password";

function ErrorBox({ message }: { message: string }) {
	return (
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
			{message}
		</div>
	);
}

const linkButtonStyle: CSSProperties = {
	background: "none",
	border: "none",
	padding: 0,
	font: "inherit",
	fontSize: 13,
	color: "var(--color-text-muted, inherit)",
	textDecoration: "underline",
	cursor: "pointer",
};

export default function LoginForm({ siteKey }: { siteKey: string }) {
	const [mode, setMode] = useState<Mode>("email");
	const [requestState, requestFormAction, requestPending] = useActionState(requestOtpAction, initialRequest);
	const [verifyState, verifyFormAction, verifyPending] = useActionState(verifyOtpAction, initialVerify);
	const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialLogin);

	// Turnstile: one widget at a time, re-rendered into whichever active form
	// needs it (the email and password steps — the code step is capped at 5
	// attempts server-side instead).
	const containerRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<string | null>(null);
	// Seed from an already-present script (client-side nav back to the login
	// page), where next/script's onLoad won't fire again.
	const [scriptReady, setScriptReady] = useState(() => typeof window !== "undefined" && !!window.turnstile);
	const needsTurnstile = mode !== "code";

	useEffect(() => {
		if (!needsTurnstile || !scriptReady || !siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
		widgetIdRef.current = window.turnstile.render(containerRef.current, { sitekey: siteKey, theme: "auto" });
		return () => {
			if (widgetIdRef.current && window.turnstile) {
				window.turnstile.remove(widgetIdRef.current);
				widgetIdRef.current = null;
			}
		};
	}, [needsTurnstile, scriptReady, siteKey, mode]);

	// A Turnstile token is single-use and dies once the server verifies it, so
	// after any completed submission (e.g. a wrong-password retry) reset the
	// widget to mint a fresh token for the next attempt.
	const anyPending = requestPending || loginPending;
	const wasPending = useRef(false);
	useEffect(() => {
		if (wasPending.current && !anyPending && widgetIdRef.current && window.turnstile) {
			window.turnstile.reset(widgetIdRef.current);
		}
		wasPending.current = anyPending;
	}, [anyPending]);

	// A successful send moves to the code step and starts the resend cooldown.
	const [resendAt, setResendAt] = useState<number | null>(null);
	useEffect(() => {
		if (requestState.status === "sent") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setMode("code");
			setResendAt(Date.now() + 60_000);
		}
	}, [requestState]);

	// 1 Hz tick while on the code step, purely to count the resend link down.
	const [nowTick, setNowTick] = useState(() => Date.now());
	useEffect(() => {
		if (mode !== "code") return;
		const timer = setInterval(() => setNowTick(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [mode]);
	const resendWait = resendAt ? Math.max(0, Math.ceil((resendAt - nowTick) / 1000)) : 0;

	const turnstileScript = siteKey ? (
		<Script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			strategy="afterInteractive"
			onLoad={() => setScriptReady(true)}
		/>
	) : null;

	if (mode === "code") {
		return (
			<form action={verifyFormAction} style={{ display: "grid", gap: 16 }}>
				<p style={{ margin: 0, fontSize: 13, lineHeight: "20px" }}>
					We&rsquo;ve emailed you a 6-digit code. Enter it below — it expires in 10 minutes.
				</p>
				{verifyState.status === "error" && <ErrorBox message={verifyState.message} />}
				<div className="field">
					<label htmlFor="admin-otp-code">Code</label>
					<input
						className="input"
						id="admin-otp-code"
						name="code"
						type="text"
						inputMode="numeric"
						pattern="\d{6}"
						maxLength={6}
						required
						autoComplete="one-time-code"
						autoFocus
					/>
				</div>
				<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={verifyPending}>
					{verifyPending ? "Checking…" : "Log in"}
				</button>
				<button type="button" style={linkButtonStyle} disabled={resendWait > 0} onClick={() => setMode("email")}>
					{resendWait > 0 ? `Resend available in ${resendWait}s` : "Didn't get it? Send a new code"}
				</button>
			</form>
		);
	}

	if (mode === "password") {
		return (
			<form action={loginFormAction} style={{ display: "grid", gap: 16 }}>
				{turnstileScript}
				{loginState.status === "error" && <ErrorBox message={loginState.message} />}
				<div className="field">
					<label htmlFor="admin-password">Password</label>
					<input className="input" id="admin-password" name="password" type="password" required autoComplete="current-password" autoFocus />
				</div>
				<div ref={containerRef} />
				<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={loginPending}>
					{loginPending ? "Checking…" : "Log in"}
				</button>
				<button type="button" style={linkButtonStyle} onClick={() => setMode("email")}>
					Back to email login
				</button>
			</form>
		);
	}

	return (
		<form action={requestFormAction} style={{ display: "grid", gap: 16 }}>
			{turnstileScript}
			{requestState.status === "error" && <ErrorBox message={requestState.message} />}
			<div className="field">
				<label htmlFor="admin-email">Email</label>
				<input className="input" id="admin-email" name="email" type="email" required autoComplete="email" autoFocus />
			</div>
			<div ref={containerRef} />
			<button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 44, fontSize: 15 }} disabled={requestPending}>
				{requestPending ? "Sending…" : "Send code"}
			</button>
			<button type="button" style={linkButtonStyle} onClick={() => setMode("password")}>
				Developer login
			</button>
		</form>
	);
}
