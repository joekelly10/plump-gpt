#!/bin/sh

while ! nc -z db 5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 0.5
done

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npm run db:seed

echo "Starting application..."
npm run preview -- --host 0.0.0.0
