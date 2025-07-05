CREATE TABLE IF NOT EXISTS xelyra.servers (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,
  owner UUID,
  created_at TIMESTAMP
);
