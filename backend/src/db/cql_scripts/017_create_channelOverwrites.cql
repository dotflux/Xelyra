CREATE TABLE IF NOT EXISTS xelyra.channel_overwrites (
  channel_id UUID,
  target_id UUID,
  "allow" SET<TEXT>,
  "deny" SET<TEXT>,
  PRIMARY KEY ((channel_id), target_id)
);