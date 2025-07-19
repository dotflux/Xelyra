CREATE TABLE IF NOT EXISTS xelyra.server_invite_lookup (
  invite_id UUID,
  server_id UUID,
  created_by UUID,
  PRIMARY KEY ((invite_id), server_id, created_by)
);
