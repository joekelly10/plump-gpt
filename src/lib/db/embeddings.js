import { prisma } from '$lib/db/prisma'
import { toPgVector } from '$lib/utils/embeddings'

const default_model = 'text-embedding-3-small'

/**
 * Save an embedding to the database (upsert - ignores if already exists)
 * @param {string} contentHash - The content hash (primary key)
 * @param {number[]} embedding - The embedding vector array
 * @param {string} model - The model used to generate the embedding
 */
export const saveEmbedding = async (contentHash, embedding, model = default_model) => {
    if (!contentHash || !embedding) return

    const vector = toPgVector(embedding)
    await prisma.$executeRawUnsafe(
        `INSERT INTO "Embedding" ("contentHash", "vector", "model", "createdAt")
         VALUES ($1, $2::vector, $3, NOW())
         ON CONFLICT ("contentHash") DO NOTHING`,
        contentHash,
        vector,
        model
    )
}

