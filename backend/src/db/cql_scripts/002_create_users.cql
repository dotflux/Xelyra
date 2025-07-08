CREATE TABLE IF NOT EXISTS xelyra.users (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  password TEXT,
  display_name TEXT,
  bio TEXT,
  pfp TEXT,
  xyn_id UUID,
  conversations list<uuid>,
  groups list<uuid>,
  servers list<uuid>,
  friends list<uuid>,
  applications list<uuid>,
  requests list<uuid>,
  requests_sent list<uuid>,
  created_at TIMESTAMP
);
