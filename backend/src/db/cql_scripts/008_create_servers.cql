CREATE TABLE IF NOT EXISTS xelyra.servers (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,
  pfp TEXT,
  owner UUID,
  created_at TIMESTAMP
);
