-- One-time login codes for the admin email login. Only the SHA-256 hash of a
-- code is stored; expired/consumed rows are deleted opportunistically on each
-- new OTP request, so the table stays tiny without a scheduled job.
CREATE TABLE admin_otp_codes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	code_hash TEXT NOT NULL,
	expires_at INTEGER NOT NULL,
	attempts INTEGER NOT NULL DEFAULT 0,
	consumed_at INTEGER,
	created_at INTEGER NOT NULL
);
