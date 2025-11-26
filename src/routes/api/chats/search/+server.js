import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'
import { formatForAPI } from '$lib/db/tools'

export const GET = async ({ url }) => {
    try {
        const filter   = url.searchParams.get('filter'),
              page     = Number(url.searchParams.get('page') ?? 1),
              per_page = Number(url.searchParams.get('per_page') ?? 20),
              query    = url.searchParams.get('query') ?? '',
              mode     = url.searchParams.get('mode') ?? 'insensitive'

        const search_terms = query.split(' ').filter(term => term.trim().length > 0)
        
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

        const data = {
            items,
            total_items,
            page,
            per_page,
            total_pages: Math.ceil(total_items / per_page)
        }

        return json(data, { status: 200 })
    } catch (error) {
        console.error('Error searching chats:', error)
        return json({ message: 'Failed to search chats' }, { status: 500 })
    }
}
