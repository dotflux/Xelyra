CREATE KEYSPACE IF NOT EXISTS xelyra
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};