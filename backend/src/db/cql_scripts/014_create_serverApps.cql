CREATE TABLE IF NOT EXISTS xelyra.server_apps (
  server_id   UUID,
  app_id     UUID,
  roles list<uuid>,
  joined_at   TIMESTAMP,
  PRIMARY KEY ((server_id), app_id)
);