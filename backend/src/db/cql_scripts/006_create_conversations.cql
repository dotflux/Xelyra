CREATE TABLE IF NOT EXISTS xelyra.conversations (
  id UUID PRIMARY KEY,
  dm_id TEXT,
  participants list<uuid>,
  type TEXT,
  created_at TIMESTAMP
);
