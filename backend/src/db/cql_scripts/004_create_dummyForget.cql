CREATE TABLE IF NOT EXISTS xelyra.dummyForget (
  id UUID,
  email TEXT,
  new_password TEXT,
  otp TEXT,
  created_at TIMESTAMP,
  PRIMARY KEY ((id), email)
) WITH default_time_to_live = 300;
