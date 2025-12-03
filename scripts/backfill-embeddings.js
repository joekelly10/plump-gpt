import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import 'dotenv/config'

const prisma = new PrismaClient()

const EMBEDDING_MODEL      = 'text-embedding-3-small',
      EMBEDDING_DIMENSIONS = 1536,
      BATCH_SIZE           = 50,
      DELAY_MS             = 100,
      MAX_CHARS            = 32000 // ~8192 tokens (conservative: ~4 chars/token)

// Parse command-line arguments
const args       = process.argv.slice(2),
      run_hashes = args.includes('--hashes') || args.includes('-h'),
      run_embeds = args.includes('--embeddings') || args.includes('-e'),
      show_help  = args.includes('--help'),
      run_all    = !run_hashes && !run_embeds && !show_help

// Parse --limit N
const limit_idx  = args.findIndex(a => a === '--limit' || a === '-l'),
      limit      = limit_idx !== -1 && args[limit_idx + 1] 
                       ? parseInt(args[limit_idx + 1], 10) 
                       : null

/**
 * Compute SHA-256 hash of text content
 */
const contentHash = (text) => {
    if (!text?.trim()) return null
    return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Truncate text to stay within token limit
 */
const truncate = (text) => {
    if (!text || text.length <= MAX_CHARS) return text
    return text.slice(0, MAX_CHARS)
}

/**
 * Generate embeddings via OpenAI API
 */
const generateEmbeddings = async (texts) => {
    const api_key = process.env.OPENAI_API_KEY
    
    if (!api_key) {
        throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify({
            model:      EMBEDDING_MODEL,
            dimensions: EMBEDDING_DIMENSIONS,
            input:      texts.map(truncate)
        })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return data.data
        .sort((a, b) => a.index - b.index)
        .map(item => item.embedding)
}

/**
 * Format embedding as pgvector string
 */
const toPgVector = (embedding) => `[${embedding.join(',')}]`

/**
 * Delay helper
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Step 1: Update contentHash for all messages that don't have one
 */
const backfillContentHashes = async () => {
    console.log('\n🔑 Backfilling content hashes for messages...\n')

    const messages = await prisma.message.findMany({
        where: {
            contentHash: null,
            role:        { in: ['user', 'assistant'] }
        },
        select: { id: true, content: true }
    })

    console.log(`   Found ${messages.length} messages without content hashes\n`)

    let i = 0

    for (const msg of messages) {
        i++
        if (i % 100 === 0) {
            console.log(`   ${i} of ${messages.length} messages processed`)
        }
        const hash = contentHash(msg.content)
        if (hash) {
            await prisma.message.update({
                where: { id: msg.id },
                data:  { contentHash: hash }
            })
        }
    }

    console.log(`   ✓ Content hashes updated\n`)
}

/**
 * Step 2: Update contentHash for all system prompts that don't have one
 */
const backfillPromptHashes = async () => {
    console.log('\n🔑 Backfilling content hashes for system prompts...\n')

    const prompts = await prisma.systemPrompt.findMany({
        where:  { contentHash: null },
        select: { id: true, message: true }
    })

    console.log(`   Found ${prompts.length} prompts without content hashes\n`)

    for (const prompt of prompts) {
        const hash = contentHash(prompt.message)
        if (hash) {
            await prisma.systemPrompt.update({
                where: { id: prompt.id },
                data:  { contentHash: hash }
            })
        }
    }

    console.log(`   ✓ Content hashes updated\n`)
}

/**
 * Step 3: Generate embeddings for all unique content hashes not in Embedding table
 */
const backfillEmbeddings = async () => {
    console.log('\n📝 Backfilling embeddings...\n')

    // Get all existing embedding hashes first
    const existing = await prisma.embedding.findMany({
        select: { contentHash: true }
    })
    const existing_hashes = new Set(existing.map(e => e.contentHash))

    // Get messages ordered by newest first, filtering out those with existing embeddings
    const messages = await prisma.message.findMany({
        where: {
            contentHash: { not: null },
            NOT:         { contentHash: { in: [...existing_hashes] } }
        },
        select:  { contentHash: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    })

    // Get prompts ordered by newest first, filtering out those with existing embeddings
    const prompts = await prisma.systemPrompt.findMany({
        where: {
            contentHash: { not: null },
            NOT:         { contentHash: { in: [...existing_hashes] } }
        },
        select:  { contentHash: true, message: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    })

    // Combine, dedupe, and preserve newest-first ordering
    const seen        = new Set(),
          to_generate = []

    // Messages first (ordered by newest)
    for (const m of messages) {
        if (!seen.has(m.contentHash)) {
            seen.add(m.contentHash)
            to_generate.push([m.contentHash, m.content])
        }
    }

    // Then prompts (ordered by newest)
    for (const p of prompts) {
        if (!seen.has(p.contentHash)) {
            seen.add(p.contentHash)
            to_generate.push([p.contentHash, p.message])
        }
    }

    const total_needing = to_generate.length

    // Apply limit if specified
    if (limit && limit < to_generate.length) {
        to_generate.length = limit
        console.log(`   Found ${total_needing} content hashes needing embeddings`)
        console.log(`   Limiting to newest ${limit}\n`)
    } else {
        console.log(`   Found ${to_generate.length} unique content hashes needing embeddings\n`)
    }

    if (to_generate.length === 0) return

    let processed = 0,
        failed    = 0

    for (let i = 0; i < to_generate.length; i += BATCH_SIZE) {
        const batch       = to_generate.slice(i, i + BATCH_SIZE),
              texts       = batch.map(([, content]) => content),
              hashes      = batch.map(([hash]) => hash),
              batch_num   = Math.floor(i / BATCH_SIZE) + 1,
              total_batches = Math.ceil(to_generate.length / BATCH_SIZE)

        try {
            const embeddings = await generateEmbeddings(texts)

            for (let j = 0; j < batch.length; j++) {
                const vector = toPgVector(embeddings[j])
                await prisma.$executeRawUnsafe(
                    `INSERT INTO "Embedding" ("contentHash", "vector", "model", "createdAt")
                     VALUES ($1, $2::vector, $3, NOW())
                     ON CONFLICT ("contentHash") DO NOTHING`,
                    hashes[j],
                    vector,
                    EMBEDDING_MODEL
                )
                processed++
            }

            console.log(`   Batch ${batch_num}/${total_batches}: Processed ${batch.length} embeddings`)
        } catch (error) {
            console.error(`   Batch ${batch_num}/${total_batches}: Failed - ${error.message}`)
            failed += batch.length
        }

        if (i + BATCH_SIZE < to_generate.length) {
            await delay(DELAY_MS)
        }
    }

    console.log(`\n   ✓ Embeddings complete: ${processed} processed, ${failed} failed\n`)
}

/**
 * Show help message
 */
const showHelp = () => {
    console.log(`
Usage: node backfill-embeddings.js [options]

Options:
  --hashes, -h      Backfill content hashes only (messages + system prompts)
  --embeddings, -e  Generate embeddings only (requires hashes to exist)
  --limit N, -l N   Limit embeddings to newest N messages (applies to -e)
  --help            Show this help message

Examples:
  node backfill-embeddings.js              Run full backfill (hashes + embeddings)
  node backfill-embeddings.js --hashes     Only update content hashes
  node backfill-embeddings.js -e           Only generate embeddings
  node backfill-embeddings.js -e -l 1000   Generate embeddings for newest 1000 messages
`)
}

/**
 * Main function
 */
const main = async () => {
    if (show_help) {
        showHelp()
        return
    }

    console.log('\n╔════════════════════════════════════════╗')
    console.log('║    Embedding Backfill Script           ║')
    console.log('╚════════════════════════════════════════╝')

    if (run_all || run_embeds) {
        console.log(`\n   Model: ${EMBEDDING_MODEL}`)
        console.log(`   Dimensions: ${EMBEDDING_DIMENSIONS}`)
        console.log(`   Batch size: ${BATCH_SIZE}`)
        if (limit) console.log(`   Limit: ${limit}`)
    }

    if (run_all || run_hashes) {
        await backfillContentHashes()
        await backfillPromptHashes()
    }

    if (run_all || run_embeds) {
        await backfillEmbeddings()
    }

    console.log('\n✅ Backfill complete!\n')
}

main()
    .catch((error) => {
        console.error('\n❌ Backfill failed:', error.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
