CREATE TABLE IF NOT EXISTS xelyra.server_invites (
  invite_id UUID,
  server_id UUID,
  created_by UUID,
  created_at TIMESTAMP,
  PRIMARY KEY ((server_id), created_by, invite_id)
);
