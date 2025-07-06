CREATE TABLE IF NOT EXISTS xelyra.roles (
  server_id   UUID,
  role_id     UUID,
  name TEXT,
  level INT,
  color TEXT,
  permissions SET<TEXT>,
  PRIMARY KEY ((server_id), role_id)
);