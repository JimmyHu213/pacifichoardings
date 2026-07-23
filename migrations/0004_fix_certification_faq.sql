-- Corrects the 'certification' FAQ answer: AS 4687 covers temporary fencing
-- and Class A hoardings, but Class B overhead protective structures are
-- engineered to AS/NZS 1170 loads under the SafeWork NSW Overhead Protective
-- Structures Code of Practice — not AS 4687. See
-- .planning/research/website-content-audit.md (item A3).
UPDATE faqs
SET answer = 'Yes — every hoarding we install is designed and signed off by our engineers. Class A fencing and hoardings are certified to AS 4687; Class B overhead decks are engineered to AS/NZS 1170 load cases under the SafeWork NSW Overhead Protective Structures Code of Practice. Either way you get documentation you can hand straight to your certifier or principal contractor.',
    updated_at = '2026-07-23T00:00:00.000Z'
WHERE id = 'certification';
