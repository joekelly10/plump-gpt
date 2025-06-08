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

# Set the entrypoint
ENTRYPOINT ["/app/docker/entrypoint.sh"]
