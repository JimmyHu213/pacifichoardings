-- Editable site content: company info + about page copy live in a key/value
-- settings table; the small content lists get FAQ-style tables. Everything
-- is seeded with today's live values so the D1 cutover is invisible to
-- visitors. Image values in site_settings are R2 keys; the about.*_image
-- keys are intentionally NOT seeded (absent key renders the placeholder).
CREATE TABLE site_settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO site_settings (key, value, updated_at) VALUES
	('company.phone', '1300 722 477', '2026-08-20T00:00:00.000Z'),
	('company.email', 'admin@pacificgrp.com.au', '2026-08-20T00:00:00.000Z'),
	('company.yard_suburb', 'Morisset, NSW', '2026-08-20T00:00:00.000Z'),
	('company.hours', '8am–4pm', '2026-08-20T00:00:00.000Z'),
	('company.legal_name', 'Pacific Hoarding Pty Ltd', '2026-08-20T00:00:00.000Z'),
	('company.abn', '96 686 186 934', '2026-08-20T00:00:00.000Z'),
	('company.coverage', 'Servicing Sydney & the Central Coast', '2026-08-20T00:00:00.000Z'),
	('about.headline', 'One crew. One engineer. Every hoarding.', '2026-08-20T00:00:00.000Z'),
	('about.intro', 'Pacific Hoardings designs, certifies and installs site hoardings for builders, developers and government across NSW — the same crew and the same engineer from the first site walk to the day it comes down.', '2026-08-20T00:00:00.000Z'),
	('about.who_heading', 'Who we are', '2026-08-20T00:00:00.000Z'),
	('about.who_body', 'We started as a hoarding installer and became the crew builders call when the paperwork matters as much as the panels. Every job still runs the same way — one crew stands it, one engineer signs it, and the same point of contact answers the phone from quote to dismantle.', '2026-08-20T00:00:00.000Z'),
	('about.compliant_heading', 'Compliant is the minimum', '2026-08-20T00:00:00.000Z'),
	('about.compliant_body', 'Anyone can stand a fence. We design and certify every hoarding to AS 4687, walk it past council before the first panel goes up, and keep it standing through the wind study, the inspection and eighteen months of the public leaning on it. Compliant is the floor we build from, not the ceiling we aim for.', '2026-08-20T00:00:00.000Z'),
	('about.yard_body', 'Every panel and gantry goes out of the same Morisset yard, measured and staged against the site plan before the truck leaves. It's also where the paperwork gets filed — one address for the whole job.', '2026-08-20T00:00:00.000Z'),
	('about.crew_image_alt', 'Pacific Hoardings crew on site', '2026-08-20T00:00:00.000Z'),
	('about.yard_image_alt', 'Pacific Hoardings yard, Morisset', '2026-08-20T00:00:00.000Z');

CREATE TABLE stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	value TEXT NOT NULL,
	label TEXT NOT NULL,
	detail TEXT NOT NULL,
	accent INTEGER NOT NULL DEFAULT 0,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO stats (value, label, detail, accent, sort_order, created_at, updated_at) VALUES
	('A + B', 'Classes installed', 'Fence-type and overhead gantry', 0, 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('AS 4687', 'Certified to', 'Engineer-signed on every job', 1, 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('0', 'Failed inspections', 'Across every council we work in', 1, 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE clients (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO clients (name, sort_order, created_at, updated_at) VALUES
	('Harbourline Constructions', 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Westgate Civil', 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Meridian Developments', 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Stonefield Group', 3, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Axiom Build', 4, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Port & Pier Projects', 5, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Crestline Developers', 6, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('NSW Public Works', 7, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE compliance_tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL,
	accent INTEGER NOT NULL DEFAULT 0,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO compliance_tags (label, accent, sort_order, created_at, updated_at) VALUES
	('AS 4687 certified', 1, 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('SafeWork NSW compliant', 0, 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('$20M public liability', 0, 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Licensed installers', 0, 3, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE testimonials (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	quote TEXT NOT NULL,
	source TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO testimonials (quote, source, sort_order, created_at, updated_at) VALUES
	('“They had the Class B up over the footpath in a weekend — certified, lit, and signed off by council before we''d finished demo.”', '— Site manager, tier-one builder, Sydney', 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('“Quote on Tuesday, hoarding standing Friday. The graphics wrap made the client happier than the building did.”', '— Development director, North Sydney', 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');
