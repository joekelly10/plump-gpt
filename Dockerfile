FROM node:20-slim

WORKDIR /app

# Install dependencies including PostgreSQL client tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the SvelteKit app
RUN npm run build

# Expose the port the app runs on
EXPOSE 1337

# Create a startup script that runs migrations and starts the app
RUN echo '#!/bin/sh\n\
# Wait for the database to be ready\n\
while ! nc -z db 5432; do\n\
  echo "Waiting for PostgreSQL to start..."\n\
  sleep 0.5\n\
done\n\
\n\
# Run database migrations\n\
npx prisma migrate deploy\n\
\n\
# Seed the database\n\
npm run db:seed\n\
\n\
# Start the application\n\
npm run preview -- --host 0.0.0.0\n\
' > /app/docker-entrypoint.sh \
&& chmod +x /app/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]
