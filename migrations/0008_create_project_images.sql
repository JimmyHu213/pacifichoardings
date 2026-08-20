-- Projects move from one photo to a gallery. Existing single-photo columns
-- migrate into project_images (lowest sort_order = cover photo) and are then
-- dropped from projects. R2 objects are untouched — only the rows move.
CREATE TABLE IF NOT EXISTS project_images (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	image_key TEXT NOT NULL,
	image_alt TEXT,
	width INTEGER,
	height INTEGER,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id, sort_order);

INSERT INTO project_images (project_id, image_key, image_alt, width, height, sort_order, created_at)
SELECT id, image_key, image_alt, image_width, image_height, 0, updated_at
FROM projects
WHERE image_key IS NOT NULL;

ALTER TABLE projects DROP COLUMN image_key;
ALTER TABLE projects DROP COLUMN image_alt;
ALTER TABLE projects DROP COLUMN image_width;
ALTER TABLE projects DROP COLUMN image_height;
