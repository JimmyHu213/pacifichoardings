# Admin Left-Sidebar Layout Implementation Plan (CMS PR 0)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin top-header nav with a left sidebar (grouped links, active highlight, View-site link, Log out), collapsing to a top bar + drawer on narrow screens.

**Architecture:** The protected layout (`src/app/admin/(protected)/layout.tsx`) stays a server component owning the auth guard, the nav model, and the server-action footer (View site + Log out form); a new client component `admin-nav.tsx` renders the sidebar/topbar/drawer and the `usePathname` active state. Responsive behavior lives in new `.admin-*` classes in `theme.css`, reusing the existing `.nav-hamburger` button (already display-toggled at the 900px breakpoint).

**Tech Stack:** Next.js 16 App Router, plain CSS in `src/app/theme.css`, existing style tokens. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-19-admin-cms-expansion-design.md` Part 1.

## Global Constraints

- Nav structure: Dashboard above the groups; group **Inbox** → Quotes; group **Content** → Projects, FAQs. (Future CMS sections join Content in later PRs — do NOT add links for pages that don't exist yet.)
- Pinned to the sidebar bottom: **View site** (links to `/`, `target="_blank"`, `rel="noopener"`) then the existing **Log out** button (same `logoutAction`).
- Active state: current section highlighted; `/admin` matches exactly, other links match themselves or any subpath.
- Below 900px (the existing breakpoint in `theme.css`): sidebar hidden; compact top bar (brand + `.nav-hamburger`); hamburger opens the nav as a fixed overlay drawer with a click-to-close scrim; drawer closes on route change and Escape (match `src/components/mobile-menu.tsx`).
- Auth guard, `metadata`, and `logoutAction` wiring unchanged. Existing admin pages need no edits.
- Existing tokens/classes only — tabs, double quotes, inline-style idiom for one-off styles, classes in `theme.css` for anything responsive.
- Conventional Commits; branch `feat/admin-layout`; never touch `main`.
- Shell note: prefix every node/npm/npx command with `NODE_OPTIONS= ` (broken preload otherwise).
- Verification: `NODE_OPTIONS= npm run lint`, `NODE_OPTIONS= npx tsc --noEmit`, `NODE_OPTIONS= npm test` (Playwright — existing specs must stay green; no new authenticated e2e in this PR), manual dev-server check.

---

### Task 1: Admin shell CSS

**Files:**
- Modify: `src/app/theme.css` (append at end of file)

**Interfaces:**
- Produces (used by Task 2): classes `.admin-shell`, `.admin-sidebar` (+ `.is-open`), `.admin-main`, `.admin-topbar`, `.admin-brand`, `.admin-nav-group`, `.admin-nav-link` (+ `.is-active`), `.admin-sidebar-footer`, `.admin-scrim`. Reuses existing `.nav-hamburger` / `.nav-hamburger-icon` (defined at `theme.css:324-384`) unchanged.

- [ ] **Step 1: Append the admin shell styles**

Add to the end of `src/app/theme.css`:

```css
/* Admin shell — permanent sidebar on desktop; under 900px the sidebar
   becomes a hamburger-toggled overlay drawer beneath a compact top bar.
   Breakpoint matches the public nav's existing 900px rules above. */
.admin-shell { display: flex; min-height: 100svh; }
.admin-main { flex: 1; min-width: 0; }
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 16px;
  border-right: 1px solid var(--color-divider);
  position: sticky;
  top: 0;
  height: 100svh;
  overflow-y: auto;
}
.admin-brand {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.admin-nav-group {
  display: block;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-accent-700);
  margin: 0 0 6px;
}
.admin-nav-link {
  display: block;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 20px;
  color: inherit;
  text-decoration: none;
  border-left: 2px solid transparent;
}
.admin-nav-link:hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }
.admin-nav-link.is-active {
  border-left-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}
.admin-sidebar-footer { margin-top: auto; display: grid; gap: 12px; }
.admin-topbar { display: none; }
.admin-scrim { display: none; }
@media (max-width: 900px) {
  .admin-shell { display: block; }
  .admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-divider);
    position: sticky;
    top: 0;
    background: var(--color-bg);
    z-index: 40;
  }
  .admin-sidebar {
    display: none;
    position: fixed;
    inset: 0 auto 0 0;
    width: min(280px, 80vw);
    height: 100svh;
    z-index: 50;
    background: var(--color-bg);
  }
  .admin-sidebar.is-open { display: flex; }
  .admin-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 45;
    background: color-mix(in srgb, var(--color-text) 30%, transparent);
  }
}
```

- [ ] **Step 2: Verify the stylesheet still builds**

Run: `NODE_OPTIONS= npm run lint`
Expected: clean (eslint doesn't lint CSS, but this catches accidental TS damage; the CSS itself is validated by the dev server in Task 2).

- [ ] **Step 3: Commit**

```bash
git add src/app/theme.css
git commit -m "feat: add admin shell styles for the left-sidebar layout"
```

---

### Task 2: AdminNav component + layout rework

**Files:**
- Create: `src/app/admin/(protected)/admin-nav.tsx`
- Modify: `src/app/admin/(protected)/layout.tsx` (replace the header/nav JSX; auth guard and metadata untouched)

**Interfaces:**
- Consumes: Task 1's `.admin-*` classes; existing `.nav-hamburger` markup pattern from `src/components/mobile-menu.tsx:40-53`; existing `logoutAction` from `src/app/admin/actions.ts`.
- Produces: `AdminNav({ groups, children })` default export and `interface AdminNavGroup { label: string | null; items: { href: string; label: string }[] }` — later CMS PRs add entries to the layout's `NAV_GROUPS` only.

- [ ] **Step 1: Create the client nav component**

Create `src/app/admin/(protected)/admin-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export interface AdminNavGroup {
	label: string | null;
	items: { href: string; label: string }[];
}

// Sidebar on desktop; under 900px (theme.css .admin-* rules) a compact top
// bar with the shared hamburger toggles the same nav as an overlay drawer.
// `children` is the server-rendered footer (View site + logout form), passed
// through so this client component never imports server actions.
export default function AdminNav({ groups, children }: { groups: AdminNavGroup[]; children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// Close on route change — state adjustment during render, not in an
	// effect, matching mobile-menu.tsx.
	const [prevPathname, setPrevPathname] = useState(pathname);
	if (pathname !== prevPathname) {
		setPrevPathname(pathname);
		setOpen(false);
	}

	useEffect(() => {
		if (!open) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	// /admin is the dashboard and must not light up for every subpage;
	// section links match themselves and any subpath (e.g. /admin/projects/3).
	const isActive = (href: string) =>
		href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

	return (
		<>
			<header className="admin-topbar">
				<span className="admin-brand">Pacific Hoardings — Admin</span>
				<button
					type="button"
					className="nav-hamburger"
					aria-expanded={open}
					aria-controls="admin-sidebar"
					aria-label={open ? "Close menu" : "Menu"}
					onClick={() => setOpen((v) => !v)}
				>
					<span className={`nav-hamburger-icon${open ? " is-open" : ""}`} aria-hidden="true">
						<span></span>
						<span></span>
						<span></span>
					</span>
				</button>
			</header>
			{open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
			<aside id="admin-sidebar" className={`admin-sidebar${open ? " is-open" : ""}`}>
				<span className="admin-brand">Pacific Hoardings — Admin</span>
				<nav style={{ display: "grid", gap: 20 }}>
					{groups.map((group, i) => (
						<div key={group.label ?? i}>
							{group.label && <span className="admin-nav-group">{group.label}</span>}
							{group.items.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={`admin-nav-link${isActive(item.href) ? " is-active" : ""}`}
								>
									{item.label}
								</Link>
							))}
						</div>
					))}
				</nav>
				<div className="admin-sidebar-footer">{children}</div>
			</aside>
		</>
	);
}
```

- [ ] **Step 2: Rework the protected layout**

Replace the contents of `src/app/admin/(protected)/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-session";
import { logoutAction } from "../actions";
import AdminNav, { type AdminNavGroup } from "./admin-nav";

export const metadata: Metadata = {
	title: "Pacific Hoardings — Admin",
	robots: { index: false, follow: false },
};

// The nav model lives here (server side) so future CMS sections are added in
// one place; AdminNav only renders it.
const NAV_GROUPS: AdminNavGroup[] = [
	{ label: null, items: [{ href: "/admin", label: "Dashboard" }] },
	{ label: "Inbox", items: [{ href: "/admin/quotes", label: "Quotes" }] },
	{
		label: "Content",
		items: [
			{ href: "/admin/projects", label: "Projects" },
			{ href: "/admin/faqs", label: "FAQs" },
		],
	},
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	const { env } = await getCloudflareContext({ async: true });
	const isAuthed = env.SESSION_SECRET ? await verifySessionCookieValue(sessionCookie, env.SESSION_SECRET) : false;

	if (!isAuthed) {
		redirect("/admin/login");
	}

	return (
		<div className="admin-shell">
			<AdminNav groups={NAV_GROUPS}>
				<a className="admin-nav-link" href="/" target="_blank" rel="noopener">
					View site ↗
				</a>
				<form action={logoutAction}>
					<button type="submit" className="btn btn-secondary" style={{ width: "100%", fontSize: 13 }}>
						Log out
					</button>
				</form>
			</AdminNav>
			<main className="admin-main">{children}</main>
		</div>
	);
}
```

(Note: the old header imported `pageGutter` from `@/lib/style-tokens` — that import is now unused and must be removed, as this replacement does. `Link` is also no longer imported by the layout; it moved into `admin-nav.tsx`.)

- [ ] **Step 3: Verify types and lint**

Run: `NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint`
Expected: both clean — specifically no unused-import warnings for the removed `Link`/`pageGutter`.

- [ ] **Step 4: Manual check in the dev server**

Run: `NODE_OPTIONS= npm run dev` and open http://localhost:3000/admin (log in via "Developer login" with the `.dev.vars` `ADMIN_PASSWORD` if prompted).

Check, resizing the window across 900px:
1. Desktop: sidebar on the left with Dashboard, Inbox→Quotes, Content→Projects/FAQs; current section highlighted when you click through; View site (new tab to the homepage) and Log out pinned at the bottom.
2. Narrow (<900px): sidebar gone; top bar with brand + hamburger; hamburger opens the drawer over a scrim; clicking a link or the scrim or pressing Escape closes it.
3. Log out still works and lands on /admin/login.

If you cannot drive a browser, verify what curl can (authenticated pages need a session cookie, so at minimum confirm `/admin` still redirects to `/admin/login` unauthenticated) and report exactly what was not checked as a concern.

Kill the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/admin-nav.tsx" "src/app/admin/(protected)/layout.tsx"
git commit -m "feat: left-sidebar admin layout with view-site link"
```

---

### Task 3: Full verification and PR

**Files:** none new (verification + PR only).

**Interfaces:**
- Consumes: Tasks 1–2 complete; the branch also carries three docs commits (CMS specs + gallery plan) that belong in this PR.

- [ ] **Step 1: Run the full verification suite**

```bash
NODE_OPTIONS= npm run test:unit
NODE_OPTIONS= npx tsc --noEmit
NODE_OPTIONS= npm run lint
NODE_OPTIONS= npm test
```

Expected: all green. The Playwright suite (13 specs incl. admin-login) touches no admin-authenticated page, so nothing needs updating; if a spec fails, debug it — do not paper over.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin feat/admin-layout
```

Read `.github/pull_request_template.md` and fill every section truthfully. PR title: `feat: left-sidebar admin layout with view-site link`. Base: `main`. Summary should note: (1) sidebar/topbar/drawer behavior and that no admin page content changed, (2) the PR also lands the CMS design docs (2026-08-14 spec + gallery plan, cherry-picked from the old feat/admin-cms branch, plus the 2026-08-19 expansion spec) so all CMS planning lives on main. End the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Do NOT merge. Report the PR URL.
