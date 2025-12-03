-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Embedding table (content-addressable storage)
CREATE TABLE "Embedding" (
    "contentHash" TEXT NOT NULL,
    "vector" vector(1536) NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("contentHash")
);

-- Add contentHash column to Message table
ALTER TABLE "Message" ADD COLUMN "contentHash" TEXT;

-- Add contentHash column to SystemPrompt table
ALTER TABLE "SystemPrompt" ADD COLUMN "contentHash" TEXT;

-- Create indexes for fast lookups
CREATE INDEX "Message_contentHash_idx" ON "Message"("contentHash");
CREATE INDEX "SystemPrompt_contentHash_idx" ON "SystemPrompt"("contentHash");

-- Create HNSW index on Embedding table for fast similarity search
CREATE INDEX "Embedding_vector_idx" ON "Embedding" USING hnsw ("vector" vector_cosine_ops);
