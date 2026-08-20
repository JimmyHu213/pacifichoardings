-- Services become fully client-managed (add/remove), so they need the same
-- explicit ordering every other editable list has — otherwise a newly added
-- service is stuck last in the nav with no way to move it. Backfilled from
-- rowid so today's order is preserved exactly.
ALTER TABLE services ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE services SET sort_order = (
	SELECT COUNT(*) FROM services AS earlier WHERE earlier.rowid < services.rowid
);
