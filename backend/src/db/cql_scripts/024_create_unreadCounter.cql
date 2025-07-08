CREATE TABLE IF NOT EXISTS xelyra.unread_counter (
  conversation UUID,
  user UUID,
  PRIMARY KEY ((conversation), user)
);