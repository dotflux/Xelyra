CREATE TABLE IF NOT EXISTS xelyra.server_members (
  server_id   UUID,
  user_id     UUID,
  roles list<uuid>,
  joined_at   TIMESTAMP,
  PRIMARY KEY ((server_id), user_id)
);