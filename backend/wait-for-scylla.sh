#!/bin/sh
# wait-for-scylla.sh

set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 9042; do
  echo "Waiting for Scylla at $host:9042..."
  sleep 2
done

echo "Scylla is up - executing command"
exec $cmd
