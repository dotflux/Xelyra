CREATE TABLE IF NOT EXISTS xelyra.requests_sent (
  sender_id UUID,
  reciever_id UUID,
  PRIMARY KEY ((sender_id), reciever_id)
);