-- Attach the first real site photography to the project gallery.
--
-- The photos are portrait and landscape in roughly equal measure, and the
-- upward shots of the gantry decks lose their subject entirely under the old
-- fixed 4:3 crop. Storing each photo's real pixel size lets the gallery render
-- it at its own aspect ratio without layout shift; rows where the dimensions
-- are unknown (anything uploaded through the admin, which does not record
-- them) keep the 4:3 behaviour.
--
-- image_alt describes the structure in frame and nothing more — no location,
-- client or dimension is claimed that the photo does not itself show.
ALTER TABLE projects ADD COLUMN image_width INTEGER;
ALTER TABLE projects ADD COLUMN image_height INTEGER;

UPDATE projects SET
	image_key = 'projects/commercial-tower-1785715200000.jpg',
	image_alt = 'Class B overhead gantry deck seen from below',
	image_width = 1200, image_height = 1600,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'commercial-tower';

UPDATE projects SET
	image_key = 'projects/mixed-use-development-1785715200000.jpg',
	image_alt = 'Hoarding panels with a printed graphics wrap',
	image_width = 1600, image_height = 1200,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'mixed-use-development';

UPDATE projects SET
	image_key = 'projects/civic-works-1785715200000.jpg',
	image_alt = 'Overhead gantry installation in progress',
	image_width = 1200, image_height = 1600,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'civic-works';

UPDATE projects SET
	image_key = 'projects/rail-corridor-upgrade-1785715200000.jpg',
	image_alt = 'Gantry hoarding faced with printed graphics panels',
	image_width = 1600, image_height = 1200,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'rail-corridor-upgrade';

UPDATE projects SET
	image_key = 'projects/heritage-facade-retention-1785715200000.jpg',
	image_alt = 'Site hoarding at the base of a scaffolded facade',
	image_width = 1200, image_height = 1600,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'heritage-facade-retention';

UPDATE projects SET
	image_key = 'projects/shopping-centre-works-1785715200000.jpg',
	image_alt = 'Overhead gantry across retail shopfronts at night',
	image_width = 1600, image_height = 900,
	updated_at = '2026-08-03T00:00:00.000Z'
WHERE slug = 'shopping-centre-works';
