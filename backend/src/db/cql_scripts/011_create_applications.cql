CREATE TABLE IF NOT EXISTS xelyra.applications (
  app_id      UUID PRIMARY KEY,
  owner_id    UUID,
  name        TEXT,
  description TEXT,
  created_at  TIMESTAMP,
  pfp         TEXT
);