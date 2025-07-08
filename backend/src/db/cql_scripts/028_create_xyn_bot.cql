INSERT INTO xelyra.bot_credentials (
  app_id,
  bot_id,
  "token",
  scopes,
  created_at
) VALUES (
  7fbed9bd-ffa3-4524-837f-100e6d831f95,
  117cd972-3760-47b9-9c38-e6bbc28196f5,
  '117cd972-3760-47b9-9c38-e6bbc28196f5.3843c729368aa00fa22bc66b251fc37ddf4ca6881f62b102d4b71ba02a698342',
  {},
  toTimestamp(now())
) IF NOT EXISTS;