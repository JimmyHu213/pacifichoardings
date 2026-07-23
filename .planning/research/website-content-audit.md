# Website Content Audit — accuracy vs NSW hoarding research

**Date:** 2026-07-23
**Basis:** `.planning/research/nsw-hoarding-regulations.md` (primary-source research).
**Scope:** compliance page, Class A / Class B service content, certification FAQ.

Each row: the current live claim → what the research says → the correction applied in this PR (or flagged for follow-up).

---

## A. The AS 4687 over-claim (the main correction)

**Finding:** AS 4687 ("Temporary fencing and hoardings") is the correct standard for **temporary fencing and Class A ground-level hoardings**. But **Class B overhead protective structures are structurally designed to AS/NZS 1170 load cases under the SafeWork NSW Overhead Protective Structures Code of Practice** — council design documents (City of Sydney, North Sydney) cite **AS 1170**, not AS 4687, for overhead decks. So blanket "everything is AS 4687" claims are imprecise for Class B.

| # | Location | Current claim | Correction |
|---|---|---|---|
| A1 | Compliance page — "AS 4687 certification" section | "AS 4687… sets the engineering benchmark **every hoarding on public land has to clear**" | Reworded: AS 4687 governs **fencing and Class A**; **Class B overhead decks are engineered to AS/NZS 1170 loads under the SafeWork NSW Overhead Protective Structures Code**. |
| A2 | `services.ts` — Class B `complianceTags` | `"AS 4687 certified"` | Changed to `"AS/NZS 1170 engineered"` (accurate for an overhead structure). |
| A3 | FAQ `certification` (in D1) | "every hoarding we install is designed and signed off **to AS 4687**" | Reworded to distinguish AS 4687 (fencing/Class A) from AS/NZS 1170 + Overhead Protective Structures Code (Class B). **Delivered as migration `0004` — needs `--remote` apply to update the live FAQ.** |

Class A keeps its "AS 4687 certified" tag — correct for a fence-type hoarding.

---

## B. Cite the current codes, not superseded ones

**Finding:** A **new SafeWork NSW "Overhead protective structures" Code of Practice commenced 12 December 2025** (replaced the 1995 code; sets 5 kPa minor / 10 kPa construction live loads to AS/NZS 1170). **City of Sydney** replaced its 2017 hoarding Guidelines with a **Code of Practice published 27 November 2025**.

| # | Location | Change |
|---|---|---|
| B1 | Compliance page | The reworked engineering section now names the **SafeWork NSW Overhead Protective Structures Code of Practice** as the governing overhead-structure standard. Metadata description updated. |

No copy on the site cited the old 1995/2017 documents by name, so there's nothing outdated to remove — but naming the current code adds credibility.

---

## C. Statutory grounding (credibility, not correction)

**Finding [verified]:** the permit power is **Roads Act 1993 s138** (consent to erect a structure on/over a public road); **LGA 1993 s68** covers associated activities (hoisting over the road). Classified roads need **Transport for NSW concurrence**.

| # | Location | Change |
|---|---|---|
| C1 | Compliance page — "Council permits & traffic control" | Added the **section 138 Roads Act 1993** reference so the claim is anchored to the actual head of power. |

---

## D. Concrete specs worth adding (credibility)

**Finding:** the Class B trigger is well-defined — a building **≥7500 mm high and <3500 mm from the street alignment** (North Sydney / Parramatta). Class A commonly ≥2.1 m with 17 mm timber panels. Re-certification at **≥6-monthly** intervals.

| # | Location | Change |
|---|---|---|
| D1 | `services.ts` — Class B `whenYouNeedIt` | Added the concrete trigger detail. |
| D2 | Compliance page — "What you get" / handover | Left as-is; certification cadence (6-monthly) is accurate to add later if wanted. |

---

## E. Well-supported — no change

- **$20M public liability** — independently confirmed at City of Sydney, North Sydney and Inner West. Keep exactly.
- **Council permits / three approvals** (hoarding permit, footpath occupation, traffic control) — accurate.
- **SafeWork NSW SWMS + HRCW licensing** — accurate.
- **"Class A / Class B" terminology** — matches SafeWork/industry usage. Councils mostly say "Type A/B"; a clarifying note is optional (not applied in this PR — candidate for a future FAQ).

---

## Follow-ups not in this PR

- FAQ `certification` correction requires applying migration `0004` to production D1 (`wrangler d1 migrations apply pacifichoardings-db --remote`) — a production write, so it needs sign-off, same as the initial migrations.
- Optional: a "councils we work across" page/section using the comparison table in the research doc (strong SEO, matches the real differentiator).
- Optional: a "Class A/B = Type A/B" clarifier FAQ.
