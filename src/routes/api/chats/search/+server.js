import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'
import { formatForAPI } from '$lib/db/tools'
import { generateEmbedding, toPgVector } from '$lib/utils/embeddings'

export const GET = async ({ url }) => {
    try {
        const filter     = url.searchParams.get('filter'),
              page       = Number(url.searchParams.get('page') ?? 1),
              per_page   = Number(url.searchParams.get('per_page') ?? 20),
              query      = url.searchParams.get('query') ?? '',
              mode       = url.searchParams.get('mode') ?? 'insensitive',
              threshold  = Number(url.searchParams.get('threshold') ?? 0.3),
              multiplier = Number(url.searchParams.get('multiplier') ?? 0.05)

        if (mode === 'semantic') {
            return semanticSearch({ query, filter, page, per_page, threshold, multiplier })
        } else {
            return regularSearch({ query, filter, page, per_page, mode })
        }
    } catch (error) {
        console.error('Error searching chats:', error)
        return json({ message: 'Failed to search chats' }, { status: 500 })
    }
}

const regularSearch = async ({ query, filter, page, per_page, mode }) => {
    const phrases      = [...query.matchAll(/"([^"]+)"/g)].map(m => m[1]),
          without      = query.replace(/"[^"]*"/g, ''),
          words        = without.split(' ').filter(term => term.trim().length > 0),
          search_terms = [...phrases, ...words]
    
    // search messages -> get distinct chat ids
    const matched_messages = await prisma.message.findMany({
        where: {
            AND: search_terms.map(term => ({
                content: {
                    contains: term,
                    mode
                }
            }))
        },
        select: {
            chatId: true
        },
        distinct: ['chatId']
    })

    const matched_chat_ids = matched_messages.map(msg => msg.chatId)

    let where = {}

    if (!filter || filter === 'all') {
        where = {
            id: {
                in: matched_chat_ids
            }
        }
    } else if (filter === 'starred') {
        where = {
            id: {
                in: matched_chat_ids
            },
            OR: [
                { stars: { isEmpty: false } },
                { highlights: { isEmpty: false } }
            ]
        }
    } else if (filter === 'non-default') {
        // filter by system prompts (always at position 0) that are not default
        const non_default_system_messages = await prisma.message.findMany({
            where: {
                chronologicalId:       0,
                systemPromptTitle:     { not: null },
                systemPromptIsDefault: false,
                chatId:                { in: matched_chat_ids }
            },
            select: {
                chatId: true
            }
        })
        
        const matched_non_default_chat_ids = non_default_system_messages.map(msg => msg.chatId)
        
        where = {
            id: {
                in: matched_non_default_chat_ids
            }
        }
    }

    const total_items = await prisma.chat.count({ where })
    
    let items = await prisma.chat.findMany({
        where,
        include: {
            messages: {
                orderBy: {
                    chronologicalId: 'asc'
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        skip:    (page - 1) * per_page,
        take:    per_page
    })
    
    items = items.map(chat => formatForAPI(chat))

    return json({
        items,
        total_items,
        page,
        per_page,
        total_pages: Math.ceil(total_items / per_page)
    }, { status: 200 })
}

const semanticSearch = async ({ query, filter, page, per_page, threshold, multiplier }) => {
    const embedding = await generateEmbedding(query)
    
    if (!embedding) {
        return json({ 
            message:     'Could not generate embedding for search query',
            items:       [],
            total_items: 0,
            page:        page,
            per_page:    per_page,
            total_pages: 0
        }, { status: 200 })
    }

    const vector = toPgVector(embedding),
          offset = (page - 1) * per_page

    let filter_join  = '',
        filter_where = ''

    if (filter === 'starred') {
        filter_where = `AND (cardinality(c."stars") > 0 OR cardinality(c."highlights") > 0)`
    } else if (filter === 'non-default') {
        filter_join = `
            INNER JOIN "Message" sys ON sys."chatId" = c."id" 
                AND sys."chronologicalId" = 0 
                AND sys."systemPromptTitle" IS NOT NULL 
                AND sys."systemPromptIsDefault" = false
        `
    }

    const count_result = await prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT m."chatId") as count
        FROM "Message" m
        INNER JOIN "Embedding" e ON e."contentHash" = m."contentHash"
        INNER JOIN "Chat" c ON c."id" = m."chatId"
        ${filter_join}
        WHERE m."contentHash" IS NOT NULL
        AND 1 - (e."vector" <=> $1::vector) > $2
        ${filter_where}
    `, vector, threshold)

    const total_items = Number(count_result[0].count)

    if (total_items === 0) {
        return json({
            items:       [],
            total_items: 0,
            page:        page,
            per_page:    per_page,
            total_pages: 0
        }, { status: 200 })
    }
    //
    // Get paginated chat IDs ordered by composite score
    //
    // Score = best_match + LN(hit_count + 1) * multiplier
    //     - This rewards both quality (best match for a single message) and
    //           quantity (multiple relevant messages (log = diminishing returns))
    //     - higher multiplier = more weight on quantity
    //
    const chat_scores = await prisma.$queryRawUnsafe(`
        WITH message_similarities AS (
            SELECT 
                m."chatId",
                m."chronologicalId",
                1 - (e."vector" <=> $1::vector) as similarity
            FROM "Message" m
            INNER JOIN "Embedding" e ON e."contentHash" = m."contentHash"
            INNER JOIN "Chat" c ON c."id" = m."chatId"
            ${filter_join}
            WHERE m."contentHash" IS NOT NULL
            AND 1 - (e."vector" <=> $1::vector) > $2
            ${filter_where}
        ),
        chat_scores AS (
            SELECT 
                "chatId",
                MAX(similarity) as best_match,
                COUNT(*) as hit_count,
                MAX(similarity) + LN(COUNT(*) + 1) * $3 as score,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'chronologicalId', "chronologicalId",
                        'similarity', "similarity"
                    ) ORDER BY "chronologicalId"
                ) as similarities
            FROM message_similarities
            GROUP BY "chatId"
        )
        SELECT "chatId", best_match, hit_count, score, similarities
        FROM chat_scores
        ORDER BY score DESC
        LIMIT $4 OFFSET $5
    `, vector, threshold, multiplier, per_page, offset)

    const chat_ids = chat_scores.map(c => c.chatId)

    const semantic_fields_map = new Map(
        chat_scores.map(c => [c.chatId, {
            similarities: c.similarities.map(s => ({ id: s.chronologicalId, similarity: s.similarity })),
            best_match:   Number(c.best_match),
            hit_count:    Number(c.hit_count),
            score:        Number(c.score)
        }])
    )

    if (chat_ids.length === 0) {
        return json({
            items:       [],
            total_items: total_items,
            page:        page,
            per_page:    per_page,
            total_pages: Math.ceil(total_items / per_page)
        }, { status: 200 })
    }

    let items = await prisma.chat.findMany({
        where: {
            id: { in: chat_ids }
        },
        include: {
            messages: {
                orderBy: {
                    chronologicalId: 'asc'
                }
            }
        }
    })

    // restore order of chats by score
    const id_order = new Map(chat_ids.map((id, idx) => [id, idx]))
    items.sort((a, b) => id_order.get(a.id) - id_order.get(b.id))

    // add semantic fields
    items = items.map(chat => {
        let formatted_chat = formatForAPI(chat)

        formatted_chat.semantic_search = {
            ...(semantic_fields_map.get(chat.id)),
            query: {
                search_phrase: query,
                threshold:     threshold,
                multiplier:    multiplier
            }
        }

        return formatted_chat
    })


    return json({
        items,
        total_items,
        page,
        per_page,
        total_pages: Math.ceil(total_items / per_page)
    }, { status: 200 })
}
