-- FAQs. Seeded from src/lib/content/static/faqs.ts with the exact same ids —
-- static Service.faqIds[] (services stay in code, see PHASE10-PLAN.md §2)
-- references these ids by string, so they need to stay stable.
CREATE TABLE IF NOT EXISTS faqs (
	id TEXT PRIMARY KEY,
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);

INSERT INTO faqs (id, question, answer, sort_order, created_at, updated_at) VALUES
('council-approval', 'Do I need council approval for a hoarding?', 'If any part of the hoarding stands on or over public land — a footpath, a road reserve, a laneway — NSW councils require a hoarding permit before installation. We prepare the drawings, the engineering certification and the traffic management plan, and lodge the application for you.', 0, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('class-a-vs-class-b', 'What''s the difference between Class A and Class B?', 'Class A is a fence-type hoarding at ground level — it separates the public from the site. Class B adds an engineered overhead deck that protects pedestrians from falling objects, and is required wherever work happens above a footpath that stays open.', 1, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('install-speed', 'How fast can you install?', 'You''ll have a measured, itemised quote within 24 hours of the site walk. Class A hoardings typically stand within days of permit approval; Class B programs depend on the engineering and council timeline — we''ll give you a date and hold it.', 2, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('certification', 'Do you provide engineering certification?', 'Yes — every hoarding we install is designed and signed off to AS 4687 by our engineers, with documentation you can hand straight to your certifier or principal contractor.', 3, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('branding-print', 'Can you print our branding on the hoarding?', 'Full-wrap printed graphics, project and marketing signage, and anti-graffiti laminate — plus all the statutory signage the site needs. Supply the artwork or have our studio lay it out.', 4, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z');
