-- Quote form submissions. Every column here is a real field the form
-- collects (src/app/quote-form.tsx) — nothing speculative.
CREATE TABLE IF NOT EXISTS quote_submissions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	company TEXT,
	email TEXT NOT NULL,
	phone TEXT,
	site_address TEXT NOT NULL,
	need TEXT,
	details TEXT,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_submissions_created_at ON quote_submissions(created_at);
