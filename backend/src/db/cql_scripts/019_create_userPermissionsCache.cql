CREATE TABLE IF NOT EXISTS xelyra.user_permissions (
  server_id   UUID,
  user_id     UUID,
  highest_level INT,
  permissions SET<TEXT>,
  PRIMARY KEY ((server_id), user_id)
);