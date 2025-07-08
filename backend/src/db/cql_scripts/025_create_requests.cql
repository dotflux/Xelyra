CREATE TABLE IF NOT EXISTS xelyra.requests (
  sender_id UUID,
  reciever_id UUID,
  PRIMARY KEY ((reciever_id), sender_id)
);