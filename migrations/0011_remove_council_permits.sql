-- Council permits is retired as a service at the client's request. The row is
-- removed here rather than by hand so the change is reviewable and applies the
-- same way to every environment. The compiled-in fallback in
-- static/services.ts drops it in the same commit, so a D1 outage can't bring
-- it back. No project references this slug and it had no uploaded photos, so
-- there is nothing else to clean up; /services/council-permits now 404s like
-- any unknown slug.
DELETE FROM services WHERE slug = 'council-permits';
