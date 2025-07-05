CREATE TABLE IF NOT EXISTS xelyra.bot_token_lookup (
  "token" TEXT PRIMARY KEY,
  app_id UUID,
  bot_id UUID
);
