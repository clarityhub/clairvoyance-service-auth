#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE "clairvoyance_auth_development";
  CREATE DATABASE "clairvoyance_auth_test";

  GRANT ALL PRIVILEGES ON DATABASE clairvoyance_auth_development to postgres;
  GRANT ALL PRIVILEGES ON DATABASE clairvoyance_auth_test to postgres;
EOSQL
