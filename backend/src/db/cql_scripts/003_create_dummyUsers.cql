CREATE TABLE IF NOT EXISTS xelyra.dummyUsers (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  password TEXT,
  otp TEXT,
  created_at TIMESTAMP
) WITH default_time_to_live = 300;
