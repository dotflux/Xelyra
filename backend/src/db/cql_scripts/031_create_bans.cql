CREATE TABLE IF NOT EXISTS xelyra.server_bans (
  server_id UUID,
  banned_id UUID,
  created_at TIMESTAMP,
  PRIMARY KEY ((server_id), banned_id)
);
