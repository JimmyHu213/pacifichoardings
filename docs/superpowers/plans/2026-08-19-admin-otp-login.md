# Admin OTP Email Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passwordless admin login — `admin@pacificgrp.com.au` receives a 6-digit emailed code at `/admin/login`; the existing shared-password login stays as a hidden developer path.

**Architecture:** Next.js 16 App Router on Cloudflare Workers via OpenNext. New server actions in `src/app/admin/actions.ts` issue and verify codes; code hashes live in a new D1 table; email goes out through a Cloudflare Email Service `send_email` binding restricted to the one admin address. Session mechanics (`src/lib/admin-session.ts`, `ph_admin_session` cookie) are unchanged and shared by both login paths.

**Tech Stack:** Next.js 16 (App Router, server actions), @opennextjs/cloudflare, Cloudflare D1 + Email Service, Turnstile, vitest (new, unit tests), Playwright (existing, e2e).

**Spec:** `docs/superpowers/specs/2026-08-19-admin-otp-login-design.md`

## Global Constraints

- OTP: 6 digits, valid 10 minutes, max 5 verify attempts, 60 s resend cooldown. Plaintext codes are never stored — SHA-256 hash only.
- `requestOtpAction` must never reveal whether an email is the admin address: wrong emails and cooldown-suppressed sends return the same `{ status: "sent" }` as a real send.
- Turnstile verification runs BEFORE any credential/email work in `requestOtpAction` and the existing `loginAction`. `verifyOtpAction` needs no Turnstile (bounded by the 5-attempt cap).
- The existing password `loginAction` must not change behavior — it is the developer and local-dev path.
- Tabs for indentation, double quotes, existing file style (see any file under `src/`). Match `src/app/admin/actions.ts` error-message tone.
- Conventional Commits (`feat:`, `test:`, `chore:` …). Never commit to `main`; all work on `feat/admin-otp-login`.
- Env/bindings pattern: new vars/bindings are declared optionally in `src/lib/admin-env.d.ts` (do NOT regenerate `cloudflare-env.d.ts` — it's the established pattern, see the comment at the top of `admin-env.d.ts`). `SendEmail` is already a global type from `cloudflare-env.d.ts`.
- Verification commands: `npm run lint`, `npx tsc --noEmit`, `npm run test:unit` (after Task 1), `npm test` (Playwright, needs no login secrets for the login-page spec).

---

### Task 1: OTP helper module (with vitest setup)

**Files:**
- Create: `src/lib/admin-otp.ts`
- Create: `src/lib/admin-otp.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (devDependency + `test:unit` script)

**Interfaces:**
- Consumes: nothing (pure module, Web Crypto only).
- Produces (used by Task 4):
  - `generateOtpCode(): string` — 6-digit numeric string, cryptographically random, unbiased.
  - `hashOtpCode(code: string): Promise<string>` — lowercase SHA-256 hex.
  - Constants: `OTP_TTL_MS = 600_000`, `OTP_MAX_ATTEMPTS = 5`, `OTP_RESEND_COOLDOWN_MS = 60_000`.

- [ ] **Step 1: Install vitest and add the script**

```bash
npm install --save-dev vitest
```

In `package.json` scripts, after `"test": "playwright test",` add:

```json
"test:unit": "vitest run",
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Playwright owns tests/ — vitest only runs co-located unit tests in src/.
		include: ["src/**/*.test.ts"],
	},
});
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/admin-otp.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateOtpCode, hashOtpCode, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "./admin-otp";

describe("generateOtpCode", () => {
	it("always returns a 6-digit numeric string", () => {
		for (let i = 0; i < 500; i++) {
			expect(generateOtpCode()).toMatch(/^\d{6}$/);
		}
	});

	it("returns varying codes", () => {
		const codes = new Set(Array.from({ length: 50 }, () => generateOtpCode()));
		expect(codes.size).toBeGreaterThan(1);
	});
});

describe("hashOtpCode", () => {
	it("returns the SHA-256 hex digest of the code", async () => {
		// Well-known vector: sha256("123456")
		expect(await hashOtpCode("123456")).toBe("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
	});

	it("differs for different codes", async () => {
		expect(await hashOtpCode("000000")).not.toBe(await hashOtpCode("000001"));
	});
});

describe("constants", () => {
	it("match the spec", () => {
		expect(OTP_TTL_MS).toBe(10 * 60 * 1000);
		expect(OTP_MAX_ATTEMPTS).toBe(5);
		expect(OTP_RESEND_COOLDOWN_MS).toBe(60 * 1000);
	});
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test:unit`
Expected: FAIL — cannot resolve `./admin-otp`.

- [ ] **Step 4: Implement the module**

Create `src/lib/admin-otp.ts`:

```ts
// One-time codes for the admin email login. Only the SHA-256 hash of a code
// is ever stored (admin_otp_codes in D1); these helpers are pure Web Crypto
// so they unit-test without a Worker runtime.
export const OTP_TTL_MS = 10 * 60 * 1000; // codes expire after 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

// Largest multiple of 10^6 that fits in a Uint32 — values at or above it are
// re-rolled so every code from 000000 to 999999 stays equally likely.
const UNBIASED_LIMIT = 4_294_000_000;

export function generateOtpCode(): string {
	const buffer = new Uint32Array(1);
	let value: number;
	do {
		crypto.getRandomValues(buffer);
		value = buffer[0];
	} while (value >= UNBIASED_LIMIT);
	return String(value % 1_000_000).padStart(6, "0");
}

export async function hashOtpCode(code: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit`
Expected: PASS (6 tests).

- [ ] **Step 6: Lint and commit**

```bash
npm run lint
git add src/lib/admin-otp.ts src/lib/admin-otp.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add OTP code helpers with vitest unit tests"
```

---

### Task 2: D1 migration for OTP codes

**Files:**
- Create: `migrations/0006_create_admin_otp_codes.sql`

**Interfaces:**
- Produces (used by Task 4): table `admin_otp_codes(id, code_hash, expires_at, attempts, consumed_at, created_at)` — all timestamps epoch milliseconds.

- [ ] **Step 1: Write the migration**

Create `migrations/0006_create_admin_otp_codes.sql`:

```sql
-- One-time login codes for the admin email login. Only the SHA-256 hash of a
-- code is stored; expired/consumed rows are deleted opportunistically on each
-- new OTP request, so the table stays tiny without a scheduled job.
CREATE TABLE admin_otp_codes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code_hash TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0,
	consumed_at INTEGER,
	created_at INTEGER NOT NULL
);
```

- [ ] **Step 2: Apply locally and verify**

```bash
npx wrangler d1 migrations apply pacifichoardings-db --local
npx wrangler d1 execute pacifichoardings-db --local --command "PRAGMA table_info(admin_otp_codes);"
```

Expected: six columns matching the SQL above.

- [ ] **Step 3: Commit**

```bash
git add migrations/0006_create_admin_otp_codes.sql
git commit -m "feat: add admin_otp_codes table for email login codes"
```

---

### Task 3: Email binding, ADMIN_EMAIL var, env types

**Files:**
- Modify: `wrangler.jsonc` (add `send_email` block after `r2_buckets`; add var to `vars`)
- Modify: `src/lib/admin-env.d.ts`

**Interfaces:**
- Produces (used by Task 4): `env.OTP_EMAIL?: SendEmail` binding, `env.ADMIN_EMAIL?: string`.

- [ ] **Step 1: Add the binding and var to wrangler.jsonc**

After the `r2_buckets` array, add:

```jsonc
"send_email": [
	{
		// OTP delivery for the admin email login. Restricted so the Worker can
		// only ever email the single admin address, even if compromised. The
		// sender domain must be onboarded to Email Sending (see the design
		// spec's deploy steps).
		"name": "OTP_EMAIL",
		"allowed_destination_addresses": ["admin@pacificgrp.com.au"]
	}
],
```

Inside the existing `vars` object, after the `TURNSTILE_SITE_KEY` entry, add:

```jsonc
// The only email allowed to log in via OTP, and the recipient of the codes.
// Public knowledge (it's the company contact address), not a secret.
"ADMIN_EMAIL": "admin@pacificgrp.com.au"
```

- [ ] **Step 2: Declare the types**

In `src/lib/admin-env.d.ts`, inside `interface CloudflareEnv`, after `TURNSTILE_SECRET_KEY?: string;` add:

```ts
ADMIN_EMAIL?: string;
// send_email binding for OTP delivery (SendEmail comes from the generated
// cloudflare-env.d.ts runtime types).
OTP_EMAIL?: SendEmail;
```

- [ ] **Step 3: Verify config and types**

```bash
npx wrangler deploy --dry-run --outdir /tmp/wrangler-dry 2>&1 | head -30
npx tsc --noEmit
```

Expected: the dry run lists the `OTP_EMAIL` send_email binding and `ADMIN_EMAIL` var without config errors; tsc passes. (If `--dry-run` complains about the missing `.open-next/worker.js` main, that's fine — config parse errors are what matters; alternatively `npx wrangler types --env-interface CloudflareEnv /tmp/check-env.d.ts` also validates the config without touching the committed file.)

- [ ] **Step 4: Commit**

```bash
git add wrangler.jsonc src/lib/admin-env.d.ts
git commit -m "feat: add OTP email binding and ADMIN_EMAIL config"
```

---

### Task 4: OTP server actions

**Files:**
- Modify: `src/app/admin/actions.ts`

**Interfaces:**
- Consumes: Task 1 helpers (`generateOtpCode`, `hashOtpCode`, `OTP_TTL_MS`, `OTP_MAX_ATTEMPTS`, `OTP_RESEND_COOLDOWN_MS`), Task 2 table, Task 3 env (`ADMIN_EMAIL`, `OTP_EMAIL`), plus existing `verifyTurnstile`, `constantTimeEqual`, `createSessionCookieValue`, `SESSION_COOKIE_NAME`, `SESSION_DURATION_MS`.
- Produces (used by Task 5):
  - `type OtpRequestState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string }`
  - `type OtpVerifyState = { status: "idle" } | { status: "error"; message: string }`
  - `requestOtpAction(prev: OtpRequestState, formData: FormData): Promise<OtpRequestState>` — reads form fields `email`, `cf-turnstile-response`.
  - `verifyOtpAction(prev: OtpVerifyState, formData: FormData): Promise<OtpVerifyState>` — reads form field `code`; on success sets the session cookie and `redirect("/admin")`.

- [ ] **Step 1: Add imports and state types**

In `src/app/admin/actions.ts`, extend the existing `@/lib/admin-session` import line and add the new module import:

```ts
import { constantTimeEqual, createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/admin-session";
import { generateOtpCode, hashOtpCode, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/admin-otp";
```

Below the existing `LoginState` type, add:

```ts
export type OtpRequestState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string };
export type OtpVerifyState = { status: "idle" } | { status: "error"; message: string };
```

- [ ] **Step 2: Add requestOtpAction**

Append after `loginAction`:

```ts
export async function requestOtpAction(_prevState: OtpRequestState, formData: FormData): Promise<OtpRequestState> {
	const email = formData.get("email");
	if (typeof email !== "string" || !email.trim()) {
		return { status: "error", message: "Enter your email address." };
	}

	const { env } = await getCloudflareContext({ async: true });
	const adminEmail = env.ADMIN_EMAIL;
	const turnstileSecret = env.TURNSTILE_SECRET_KEY;
	const otpEmail = env.OTP_EMAIL;
	if (!adminEmail || !turnstileSecret || !otpEmail) {
		console.error("OTP login is not configured — missing ADMIN_EMAIL, TURNSTILE_SECRET_KEY, or the OTP_EMAIL binding");
		return { status: "error", message: "Email login isn't configured yet." };
	}

	// Same gate as loginAction: the Turnstile challenge runs before anything
	// else, so bots can't use this action to spray emails or probe addresses.
	const turnstileToken = formData.get("cf-turnstile-response");
	if (typeof turnstileToken !== "string" || !turnstileToken) {
		return { status: "error", message: "Complete the verification challenge." };
	}
	const remoteIp = (await headers()).get("CF-Connecting-IP");
	if (!(await verifyTurnstile(turnstileToken, turnstileSecret, remoteIp))) {
		return { status: "error", message: "Verification failed — please try again." };
	}

	// Any address that isn't the admin's gets the same "sent" response as a
	// real send, so this page never confirms which email is the admin one.
	if (!constantTimeEqual(email.trim().toLowerCase(), adminEmail.toLowerCase())) {
		return { status: "sent" };
	}

	const now = Date.now();
	try {
		// Opportunistic cleanup keeps the table tiny without a scheduled job.
		await env.DB.prepare("DELETE FROM admin_otp_codes WHERE expires_at < ?1 OR consumed_at IS NOT NULL").bind(now).run();

		// Cooldown: if a live code was issued in the last minute, quietly skip
		// the send — the earlier code still works.
		const recent = await env.DB.prepare("SELECT id FROM admin_otp_codes WHERE created_at > ?1 LIMIT 1")
			.bind(now - OTP_RESEND_COOLDOWN_MS)
			.first();
		if (recent) {
			return { status: "sent" };
		}

		const code = generateOtpCode();
		await env.DB.prepare("INSERT INTO admin_otp_codes (code_hash, expires_at, created_at) VALUES (?1, ?2, ?3)")
			.bind(await hashOtpCode(code), now + OTP_TTL_MS, now)
			.run();

		await otpEmail.send({
			to: adminEmail,
			from: { email: "no-reply@pacifichoardings.com.au", name: "Pacific Hoardings" },
			subject: `${code} is your Pacific Hoardings admin code`,
			text: `Your Pacific Hoardings admin login code is ${code}.\n\nIt expires in 10 minutes. If you didn't request it, you can ignore this email.`,
		});
	} catch (error) {
		console.error("OTP request failed", error);
		return { status: "error", message: "Couldn't send the code — please try again." };
	}

	return { status: "sent" };
}
```

- [ ] **Step 3: Add verifyOtpAction**

Append after `requestOtpAction`:

```ts
export async function verifyOtpAction(_prevState: OtpVerifyState, formData: FormData): Promise<OtpVerifyState> {
	const rawCode = formData.get("code");
	const code = typeof rawCode === "string" ? rawCode.trim() : "";
	if (!/^\d{6}$/.test(code)) {
		return { status: "error", message: "Enter the 6-digit code from the email." };
	}

	const { env } = await getCloudflareContext({ async: true });
	const sessionSecret = env.SESSION_SECRET;
	if (!sessionSecret) {
		console.error("OTP login is not configured — missing SESSION_SECRET");
		return { status: "error", message: "Email login isn't configured yet." };
	}

	const now = Date.now();
	let valid = false;
	try {
		const row = await env.DB.prepare(
			"SELECT id, code_hash, attempts FROM admin_otp_codes WHERE consumed_at IS NULL AND expires_at > ?1 ORDER BY created_at DESC LIMIT 1",
		)
			.bind(now)
			.first<{ id: number; code_hash: string; attempts: number }>();
		if (!row || row.attempts >= OTP_MAX_ATTEMPTS) {
			return { status: "error", message: "That code is no longer valid — request a new one." };
		}

		// Burn the attempt before comparing, so a crash mid-check can't hand
		// out free retries.
		await env.DB.prepare("UPDATE admin_otp_codes SET attempts = attempts + 1 WHERE id = ?1").bind(row.id).run();

		valid = constantTimeEqual(await hashOtpCode(code), row.code_hash);
		if (valid) {
			await env.DB.prepare("UPDATE admin_otp_codes SET consumed_at = ?1 WHERE id = ?2").bind(now, row.id).run();
		}
	} catch (error) {
		console.error("OTP verification failed", error);
		return { status: "error", message: "Something went wrong — please try again." };
	}

	if (!valid) {
		return { status: "error", message: "Wrong code — check the email and try again." };
	}

	// Same session cookie as the password path — redirect() throws, so it must
	// stay outside the try/catch above.
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, await createSessionCookieValue(sessionSecret), {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_DURATION_MS / 1000,
	});

	redirect("/admin");
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: both pass. (`loginAction` and `logoutAction` are untouched.)

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/actions.ts
git commit -m "feat: add OTP request and verify server actions"
```

---

### Task 5: Login page UI — email-first flow with developer toggle

**Files:**
- Modify: `src/app/admin/login/login-form.tsx` (full rewrite of the component body; Turnstile plumbing is adapted from the current version)

**Interfaces:**
- Consumes: Task 4 actions/types (`requestOtpAction`, `verifyOtpAction`, `OtpRequestState`, `OtpVerifyState`) plus existing `loginAction`/`LoginState`.
- Produces: same default export `LoginForm({ siteKey }: { siteKey: string })` — `page.tsx` needs no changes.

- [ ] **Step 1: Rewrite login-form.tsx**

Replace the file contents with:

```tsx
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
```

Notes for the implementer:
- The three `if (mode === ...)` branches each return a complete form; the Turnstile container div only exists in the email and password branches, and the render effect keys on `mode` so the widget moves with it.
- `resendAt` deliberately survives the trip back to the email step, but the server cooldown is the real enforcement — the client timer is UX only.

- [ ] **Step 2: Verify types, lint, and the flow by hand**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

Manual check on http://localhost:3000/admin/login (local Turnstile test key auto-passes):
1. Email step renders with a Turnstile widget; "Developer login" swaps to the password form; "Back to email login" returns.
2. Password path still logs in with the `.dev.vars` `ADMIN_PASSWORD` and lands on `/admin`.
3. Submit a wrong email (e.g. `nobody@example.com`) on the email step → advances to the code step ("sent" response, no enumeration). Entering any code fails with "That code is no longer valid" (no row) — correct, since no code was created.
4. Submit `admin@pacificgrp.com.au` → code step; the send itself will fail or no-op locally (no real email service) — if it errors, the error box shows "Couldn't send the code"; either behavior is acceptable locally, note which one you saw. The full send path is verified on the preview deployment (Task 6).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/login-form.tsx
git commit -m "feat: email-first OTP login UI with developer password toggle"
```

---

### Task 6: Playwright coverage, full verification, PR

**Files:**
- Create: `tests/admin-login.spec.ts`

**Interfaces:**
- Consumes: Task 5 UI (labels "Email", "Password", buttons "Send code", "Developer login", "Back to email login").

- [ ] **Step 1: Write the login-page e2e test**

Create `tests/admin-login.spec.ts` (matches the style of `tests/nav.spec.ts` / `smoke.spec.ts` — single quotes there, follow that file's existing conventions):

```ts
import { test, expect } from '@playwright/test';

test.describe('admin login page', () => {
	test('shows the email-first OTP flow by default', async ({ page }) => {
		await page.goto('/admin/login');
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible();
		await expect(page.getByLabel('Password')).toHaveCount(0);
	});

	test('developer login toggle swaps to the password form and back', async ({ page }) => {
		await page.goto('/admin/login');
		await page.getByRole('button', { name: 'Developer login' }).click();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByLabel('Email')).toHaveCount(0);
		await page.getByRole('button', { name: 'Back to email login' }).click();
		await expect(page.getByLabel('Email')).toBeVisible();
	});
});
```

- [ ] **Step 2: Run the full verification suite**

```bash
npm run test:unit
npm run lint
npx tsc --noEmit
npm test
```

Expected: all pass, including the pre-existing smoke and nav specs.

- [ ] **Step 3: Commit**

```bash
git add tests/admin-login.spec.ts
git commit -m "test: cover admin login page modes with playwright"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin feat/admin-otp-login
```

Read `.github/pull_request_template.md` and fill it out completely. PR title: `feat: admin OTP email login with developer password fallback`. The body must include the deploy steps below and end with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Wait for CI (lint, PR title, commitlint) and respond to CodeRabbit findings — fix or dismiss with a reason.

---

## Deploy steps (after merge — do NOT run before the PR lands)

These need Cloudflare account access and are listed in the PR body:

1. Onboard the sender domain (one-time):
   `npx wrangler email sending enable pacifichoardings.com.au`
   then confirm DNS: `npx wrangler email sending dns get pacifichoardings.com.au`
2. Apply the migration to production D1 (one-time):
   `npx wrangler d1 migrations apply pacifichoardings-db --remote`
3. Deploy happens via the normal merge-to-main pipeline.
4. Smoke-test production: request a code with `admin@pacificgrp.com.au` at
   `https://pacifichoardings.com.au/admin/login`, confirm the email arrives and
   the code logs in. Also confirm the developer password path still works.
