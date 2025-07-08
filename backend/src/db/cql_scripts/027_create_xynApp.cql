INSERT INTO xelyra.applications (
  app_id,
  owner_id,
  name,
  description,
  created_at,
  pfp
) VALUES (
  7fbed9bd-ffa3-4524-837f-100e6d831f95,
  7fbed9bd-ffa3-4524-837f-100e6d831f95,
  'Xyn',
  'Xyn is the resident AI of Xelyra, your friendly digital assistant.',
  toTimestamp(now()),
  '/uploads/xyn_pfp.png'
) IF NOT EXISTS;