CREATE TABLE IF NOT EXISTS xelyra.groups (
  id UUID PRIMARY KEY,
  name TEXT,
  participants list<uuid>,
  owner UUID,
  type TEXT,
  created_at TIMESTAMP
);
