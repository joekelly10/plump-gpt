import { env } from '$env/dynamic/private'
import crypto from 'crypto'

const embedding_model      = 'text-embedding-3-small',
      embedding_dimensions = 1536,
      max_batch_size       = 50,
      max_chars            = 30000 // ~8192 tokens (conservative: ~4 chars/token)

const hasContent = (text) => Boolean(text?.trim())

const truncate = (text) => {
    if (!text || text.length <= max_chars) return text
    return text.slice(0, max_chars)
}

export const contentHash = (text) => {
    if (!hasContent(text)) return null
    return crypto.createHash('sha256').update(text).digest('hex')
}

export const generateEmbedding = async (text) => {
    if (!hasContent(text)) return null
    
    const embeddings = await generateEmbeddings([text])
    return embeddings?.[0] ?? null
}

export const generateEmbeddings = async (texts) => {
    if (!env.OPENAI_API_KEY) {
        console.log('🧩–❌ OPENAI_API_KEY not set (embeddings.js)')
        return texts.map(() => null)
    }

    const valid_texts = texts.filter(hasContent)
    if (valid_texts.length === 0) return texts.map(() => null)

    const results = []

    for (let i = 0; i < valid_texts.length; i += max_batch_size) {
        const batch = valid_texts.slice(i, i + max_batch_size).map(truncate)
        
        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model:      embedding_model,
                    dimensions: embedding_dimensions,
                    input:      batch
                })
            })

            if (response.ok) {
                const json          = await response.json(),
                      batch_results = json.data.sort((a, b) => a.index - b.index).map(item => item.embedding)

                results.push(...batch_results)
                console.log(`🧩 ${batch.length} embedding${batch.length === 1 ? '' : 's'} generated.`)
            } else {
                const error = await response.text()
                console.error('🧩–❌ OpenAI embedding API error:', error)
                results.push(...batch.map(() => null))
            }
        } catch (error) {
            console.error('🧩–❌ Embedding generation failed:', error)
            results.push(...batch.map(() => null))
        }
    }

    // Map results back to original positions (re-insert empty/null texts)
    let result_index = 0

    const mapped_results = texts.map(text => {
        if (!hasContent(text)) return null
        return results[result_index++]
    })

    return mapped_results
}

export const toPgVector = (embedding) => {
    if (!embedding || !Array.isArray(embedding)) return null
    return `[${embedding.join(',')}]`
}
