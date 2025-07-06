CREATE TABLE IF NOT EXISTS xelyra.channels (
  server_id   UUID,
  id          UUID,
  category UUID,
  name        TEXT,
  type TEXT,
  is_private BOOLEAN,
  created_at  TIMESTAMP,
  PRIMARY KEY ((server_id), id, category)
);