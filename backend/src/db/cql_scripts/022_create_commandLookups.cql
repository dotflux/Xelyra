CREATE TABLE IF NOT EXISTS xelyra.command_lookup (
  id UUID PRIMARY KEY,
  command TEXT,
  bot_id UUID,
  app_id UUID,
  user UUID,
  conversation UUID,
  created_at TIMEUUID,
);
