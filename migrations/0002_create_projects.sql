-- Projects gallery. Seeded from the current src/lib/content/static/projects.ts
-- so the cutover to D1 doesn't lose or change any live content — image_key
-- stays NULL until a real photo is uploaded through the admin UI; the old
-- placeholder copy becomes image_alt in the meantime.
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	detail TEXT NOT NULL,
	service_slug TEXT NOT NULL,
	timeframe TEXT NOT NULL,
	description TEXT NOT NULL,
	image_key TEXT,
	image_alt TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);

INSERT INTO projects (slug, title, detail, service_slug, timeframe, description, image_key, image_alt, sort_order, created_at, updated_at) VALUES
('commercial-tower', 'Commercial tower', 'Class B gantry, 140 lm, Sydney CBD', 'class-b-hoarding', '2025 · 10-month program', 'A 140-linear-metre Class B gantry over a live CBD footpath, engineered around three separate awning interfaces and a council-mandated pedestrian corridor. Under-awning lighting and the full load documentation were signed off before the first panel went up.', NULL, 'Commercial tower Class B gantry, Sydney CBD', 0, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('mixed-use-development', 'Mixed-use development', 'Class A with full graphics wrap, Parramatta', 'class-a-hoarding', '2024 · 14-month program', 'Class A hoarding around a full city-block development site, wrapped floor-to-floor in the developer''s render imagery. The wrap held up through two Parramatta storm seasons without a panel needing to come down.', NULL, 'Mixed-use development hoarding with graphics wrap, Parramatta', 1, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('civic-works', 'Civic works', 'Temporary fencing and staged hoarding, Newcastle', 'temporary-fencing', '2025 · staged over 5 months', 'Temporary fencing for site establishment, followed by a staged Class A hoarding program as the works moved block by block down the street. Each stage was permitted and installed without closing the footpath for more than a weekend.', NULL, 'Staged temporary fencing and hoarding, Newcastle', 2, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('rail-corridor-upgrade', 'Rail corridor upgrade', 'Class A, 300 lm staged program, Western Sydney', 'class-a-hoarding', '2024–25 · 11-month program', '300 linear metres of Class A hoarding along an active rail corridor, staged across six precincts to keep the line operating through the program. Every stage carried its own permit and traffic control plan.', NULL, 'Rail corridor upgrade hoarding, Western Sydney', 3, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('heritage-facade-retention', 'Heritage facade retention', 'Class B gantry with scaffold interface, The Rocks', 'class-b-hoarding', '2025 · 7-month program', 'A Class B gantry tied directly into the scaffold protecting a retained heritage facade, drawn to interface loads the standard catalogue doesn''t cover. Council and the heritage assessor both signed off the engineering before steel went up.', NULL, 'Heritage facade retention with Class B gantry, The Rocks', 4, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z'),
('shopping-centre-works', 'Shopping centre works', 'Internal hoarding with graphics wrap, Chatswood', 'class-a-hoarding', '2025 · 4-month program', 'Internal Class A hoarding through a trading centre, wrapped in leasing signage so the vacant tenancies kept selling themselves while the fit-out ran behind them. Installed and struck section by section to keep the centre trading.', NULL, 'Internal hoarding with graphics wrap, Chatswood shopping centre', 5, '2026-07-21T00:00:00.000Z', '2026-07-21T00:00:00.000Z');
