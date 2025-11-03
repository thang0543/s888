#!/bin/bash
echo "Waiting for Oracle DB to be ready..."
until echo exit | sqlplus SYSTEM/oracle@//db:1521/XEPDB1; do
  sleep 5
done

echo "Oracle is ready. Running database.sql..."
sqlplus SYSTEM/oracle@//db:1521/XEPDB1 @/app/database.sql

echo "Starting Spring Boot..."
java -jar /app/app.jar
