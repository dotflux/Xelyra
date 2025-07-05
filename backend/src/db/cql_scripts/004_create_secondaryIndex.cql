CREATE INDEX IF NOT EXISTS users_email_idx ON xelyra.users (email);
CREATE INDEX IF NOT EXISTS users_username_idx ON xelyra.users (username);
CREATE INDEX IF NOT EXISTS dummyUsers_email_idx ON xelyra.dummyUsers (email);