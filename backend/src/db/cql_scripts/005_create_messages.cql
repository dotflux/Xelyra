CREATE TABLE IF NOT EXISTS xelyra.messages (
  id UUID,
  message TEXT,
  user UUID,
  conversation UUID,
  files LIST<FROZEN<file_info>>,
  embeds LIST<TEXT>,
  is_read BOOLEAN,
  edited BOOLEAN,
  created_at TIMEUUID,
  reply_to TIMEUUID,
  PRIMARY KEY ((conversation), created_at)
);
