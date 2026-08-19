# Admin OTP Email Login — Design Spec

**Date:** 2026-08-19
**Status:** Approved by Jimmy
**Branch:** `feat/admin-otp-login`

## Goal

Give the client a passwordless admin login: they enter `admin@pacificgrp.com.au`
on `/admin/login`, receive a one-time 6-digit code by email, and enter it to get
a session. The existing shared-password login stays as a developer-only path
(used by Jimmy to check deployed results, and as the local-dev login where email
sending isn't available).

## Current state (what this builds on)

- `/admin/login` is a single password form (`src/app/admin/login/`), verified by
  `loginAction` in `src/app/admin/actions.ts` against the `ADMIN_PASSWORD`
  secret with constant-time comparison.
- Every login attempt is gated by a Turnstile CAPTCHA before credentials are
  checked.
- Sessions are stateless: a 12-hour-expiry payload HMAC-signed with
  `SESSION_SECRET` (`src/lib/admin-session.ts`), stored in the `ph_admin_session`
  cookie. No server-side session store.
- The project has **no email-sending capability** today. The
  `pacifichoardings.com.au` zone is on Cloudflare with custom domains bound to
  this Worker.

## Decisions made

| Decision | Choice |
| --- | --- |
| Email delivery | Cloudflare Email Routing `send_email` Worker binding (free, no third-party account). Restriction "verified destinations only" is acceptable: the sole recipient is the fixed admin address. |
| Login UI | Email-first two-step OTP flow; existing password form hidden behind a small "Developer login" toggle. |
| Code format | 6 digits, valid 10 minutes, max 5 verify attempts, 60 s resend cooldown. |
| Session | Unchanged — same 12 h signed cookie for both login paths. |

## Architecture

### 1. Email infrastructure (one-time, outside code)

- Enable **Email Routing** on the `pacifichoardings.com.au` zone (Cloudflare
  adds MX/SPF records automatically; no effect on the website).
- Verify `admin@pacificgrp.com.au` as a **destination address** — someone with
  that inbox clicks one confirmation email. Production OTP delivery does not
  work until this is done; the developer password path is unaffected.
- `wrangler.jsonc`: add a `send_email` binding with
  `destination_address: "admin@pacificgrp.com.au"` so the Worker physically
  cannot email any other address. Sender: `no-reply@pacifichoardings.com.au`.
- New var `ADMIN_EMAIL = "admin@pacificgrp.com.au"` (not a secret).

### 2. Data — one D1 migration

`migrations/0006_create_admin_otp_codes.sql`:

```sql
CREATE TABLE admin_otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code_hash TEXT NOT NULL,        -- SHA-256 of the 6-digit code; plaintext never stored
  expires_at INTEGER NOT NULL,    -- epoch ms
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at INTEGER,            -- epoch ms, NULL until used
  created_at INTEGER NOT NULL     -- epoch ms
);
```

Expired/consumed rows are deleted opportunistically at the start of each new
OTP request — no cron needed.

### 3. Server actions (`src/app/admin/actions.ts`)

- **`requestOtpAction(email)`**
  1. Verify Turnstile token (same pattern as the existing `loginAction`) —
     stops automated email-bombing before anything else runs.
  2. Compare the submitted email to `ADMIN_EMAIL`. On mismatch, return the same
     generic success message as a real send ("If that address is registered, a
     code has been sent") so the page never confirms which email is the admin
     one.
  3. Cooldown: if a non-consumed code was created less than 60 s ago, return
     the generic success message without sending a new one.
  4. Generate a 6-digit code with `crypto.getRandomValues`, store its SHA-256
     hash with a 10-minute expiry, send the plaintext code via the
     `send_email` binding (plain-text MIME message).
- **`verifyOtpAction(code)`**
  1. Load the newest non-consumed, non-expired code row.
  2. Reject if `attempts >= 5`; otherwise increment `attempts` first, then do a
     constant-time comparison of hashes (reuse `constantTimeEqual`).
  3. On match: mark consumed, set the same session cookie
     `createSessionCookieValue` already produces, redirect to `/admin`.
- **`loginAction` (password) — untouched.** Developer path and local-dev path.

Failure behavior everywhere is fail-closed with generic error messages, matching
the existing action's style.

### 4. Login UI (`src/app/admin/login/`)

Two-step OTP flow as the default face of the page:

1. **Step 1:** email input + Turnstile widget → "Send code".
2. **Step 2:** "We've emailed you a code" + 6-digit code input + a "Resend
   code" link disabled for the 60 s cooldown.

A small **"Developer login"** link at the bottom swaps in the existing password
form (which keeps its own Turnstile gate). Existing form styling and components
are reused; no visual redesign.

### 5. Local development

The `send_email` binding does not deliver real mail under `wrangler dev` / local
Next dev. The developer password path is the supported local login. No special
dev-mode OTP backdoor.

## Testing

- **Unit tests** for the OTP helper module (code generation shape, hashing,
  expiry logic, attempt-limit logic), in the same style as existing tests.
- **Manual verification:** developer password path locally; full OTP path on a
  preview deployment once the destination address is verified (requires inbox
  access for `admin@pacificgrp.com.au`).

## Delivery

- One focused PR from `feat/admin-otp-login` into `main`, through the normal
  CodeRabbit + human review flow.
- External dependency flagged in the PR: destination-address verification must
  be completed by the client before the OTP path works in production.

## Out of scope

- Multiple admin users / a users table.
- Changing session duration or session mechanics.
- HTML email templates (plain text is fine for a 6-digit code).
- Removing the shared developer password.
