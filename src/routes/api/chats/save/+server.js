import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const POST = async ({ request }) => {
    try {
        const { id, messages, forks, active_fork, stars, highlights } = await request.json()
        
        let record

        if (id) {
            // 1. update existing Chat
            record = await prisma.chat.update({
                where: { id },
                data: {
                    forks,
                    activeFork: active_fork,
                    stars,
                    highlights
                }
            })

            // 2. delete and recreate all Messages (for simplicity)
            await prisma.message.deleteMany({
                where: { chatId: id }
            })

            await prisma.message.createMany({
                data: messages.map(msg => ({
                    chatId:                id,
                    chronologicalId:       msg.id,
                    chronologicalParentId: msg.parent_id,
                    role:                  msg.role,
                    content:               msg.content,
                    ...(msg.role === 'system' && {
                        systemPromptId:        msg.system_prompt_id,
                        systemPromptTitle:     msg.system_prompt_title,
                        systemPromptIsDefault: msg.is_default
                    }),
                    ...(msg.role === 'assistant' && {
                        model:            msg.model,
                        temperature:      msg.temperature,
                        topP:             msg.top_p,
                        usage:            msg.usage,
                        reasoningContent: msg.reasoning_content
                    })
                }))
            })
        } else {
            // create new Chat
            record = await prisma.chat.create({
                data: {
                    forks,
                    activeFork: active_fork,
                    stars,
                    highlights,
                    messages: {
                        create: messages.map(msg => ({
                            chronologicalId:       msg.id,
                            chronologicalParentId: msg.parent_id,
                            role:                  msg.role,
                            content:               msg.content,
                            ...(msg.role === 'system' && {
                                systemPromptId:        msg.system_prompt_id,
                                systemPromptTitle:     msg.system_prompt_title,
                                systemPromptIsDefault: msg.is_default
                            }),
                            ...(msg.role === 'assistant' && {
                                model:            msg.model,
                                temperature:      msg.temperature,
                                topP:             msg.top_p,
                                usage:            msg.usage,
                                reasoningContent: msg.reasoning_content
                            })
                        }))
                    }
                }
            })
        }

        // fetch the complete chat
        let saved_chat = await prisma.chat.findUnique({
            where: { id: record.id },
            include: {
                messages: {
                    orderBy: {
                        chronologicalId: 'asc'
                    }
                }
            }
        })

        // standardise to API format
        saved_chat = {
            ...saved_chat,
            active_fork: saved_chat.activeFork,
            messages:    saved_chat.messages.map(message => ({
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
        }

        return json({ saved_chat }, { status: 201 })
    } catch (error) {
        console.error('Error saving chat:', error)
        return json({ message: 'Failed to save chat' }, { status: 500 })
    }
}
