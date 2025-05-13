import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const GET = async ({ url }) => {
    try {
        const filter   = url.searchParams.get('filter')
        const page     = Number(url.searchParams.get('page') ?? 1)
        const per_page = Number(url.searchParams.get('per_page') ?? 20)

        let where = {}
        
        if (filter === 'starred') {
            where = {
                OR: [
                    { stars: { isEmpty: false } },
                    { highlights: { isEmpty: false } }
                ]
            }
        } else if (filter === 'non-default') {
            // find system prompts (always at position 0) that are not default
            const non_default_system_messages = await prisma.message.findMany({
                where: {
                    chronologicalId:       0,
                    systemPromptTitle:     { not: null },
                    systemPromptIsDefault: false
                },
                select: {
                    chatId: true
                }
            })
            
            const non_default_chat_ids = non_default_system_messages.map(msg => msg.chatId)

            where = {
                id: {
                    in: non_default_chat_ids
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

        // standardise to API format
        items = items.map(chat => ({
            ...chat,
            active_fork: chat.activeFork,
            messages:    chat.messages.map(message => ({
                ...message,
                db_id:     message.id,
                id:        message.chronologicalId,
                parent_id: message.chronologicalParentId,
                timestamp: message.updatedAt,
                ...(message.role === 'system' && {
                    system_prompt_id:    message.systemPromptId,
                    system_prompt_title: message.systemPromptTitle,
                    is_default:          message.systemPromptIsDefault
                }),
                ...(message.role === 'assistant' && {
                    top_p: message.topP
                })
            }))
        }))

        const data = {
            items,
            total_items,
            page,
            per_page,
            total_pages: Math.ceil(total_items / per_page)
        }

        return json(data, { status: 200 })
    } catch (error) {
        console.error('Error fetching chats:', error)
        return json({ message: 'Failed to fetch chats' }, { status: 500 })
    }
}
