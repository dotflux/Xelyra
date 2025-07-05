CREATE TABLE IF NOT EXISTS xelyra.bot_credentials (
  app_id   UUID,
  bot_id UUID,
  "token"    TEXT,
  scopes   SET<TEXT>,
  created_at TIMESTAMP,
  PRIMARY KEY ((app_id), bot_id)
);