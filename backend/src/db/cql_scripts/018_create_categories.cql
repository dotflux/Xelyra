CREATE TABLE IF NOT EXISTS xelyra.categories (
  server_id   UUID,
  id          UUID,
  name        TEXT,
  is_private BOOLEAN,
  created_at  TIMESTAMP,
  PRIMARY KEY ((server_id), id)
);