CREATE TABLE IF NOT EXISTS xelyra.conversations (
  id UUID PRIMARY KEY,
  dm_id TEXT,
  participants list<uuid>,
  type TEXT,
  last_message_timestamp TIMESTAMP,
  created_at TIMESTAMP
);
