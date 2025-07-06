CREATE TABLE IF NOT EXISTS xelyra.slash_commands (
  app_id     UUID,
  command    TEXT,
  description TEXT,
  options     TEXT,
  created_at TIMESTAMP,
  PRIMARY KEY ((app_id), command)
);
