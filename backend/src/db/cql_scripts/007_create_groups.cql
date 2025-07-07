CREATE TABLE IF NOT EXISTS xelyra.groups (
  id UUID PRIMARY KEY,
  name TEXT,
  participants list<uuid>,
  pfp TEXT,
  owner UUID,
  type TEXT,
  created_at TIMESTAMP
);
