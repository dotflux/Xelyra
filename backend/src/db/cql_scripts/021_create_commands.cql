CREATE TABLE IF NOT EXISTS xelyra.commands (
  id UUID,
  command TEXT,
  message TEXT,
  embeds LIST<TEXT>,
  buttons LIST<TEXT>,
  app_id UUID,
  bot_id UUID,
  user UUID,
  conversation UUID,
  edited BOOLEAN,
  created_at TIMEUUID,
  PRIMARY KEY ((conversation), created_at)
);
