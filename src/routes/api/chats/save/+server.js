import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { prisma } from '$lib/db/prisma'
import { formatForAPI } from '$lib/db/tools'
import { contentHash, generateEmbeddings } from '$lib/utils/embeddings'
import { saveEmbedding } from '$lib/db/embeddings'

export const POST = async ({ request }) => {
    try {
        const { id, messages, forks, active_fork, stars, highlights } = await request.json()

        // Compute content hashes for all messages
        const messages_with_hashes = messages.map(msg => ({
            ...msg,
            content_hash: (msg.role === 'user' || msg.role === 'assistant') ? contentHash(msg.content) : null
        }))

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
                data: messages_with_hashes.map(msg => ({
                    chatId:                id,
                    chronologicalId:       msg.id,
                    chronologicalParentId: msg.parent_id,
                    role:                  msg.role,
                    content:               msg.content,
                    contentHash:           msg.content_hash,
                    ...(msg.role === 'system' && {
                        systemPromptId:        msg.system_prompt_id,
                        systemPromptTitle:     msg.system_prompt_title,
                        systemPromptIsDefault: msg.is_default
                    }),
                    ...(msg.role === 'assistant' && {
                        model:            msg.model,
                        temperature:      msg.temperature,
                        topP:             msg.top_p,
                        reasoningEffort:  msg.reasoning_effort,
                        verbosity:        msg.verbosity,
                        tools:            msg.tools,
                        reasoningContent: msg.reasoning_content,
                        signature:        msg.signature,
                        toolUses:         msg.tool_uses,
                        usage:            msg.usage,
                        raw:              msg.raw
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
                        create: messages_with_hashes.map(msg => ({
                            chronologicalId:       msg.id,
                            chronologicalParentId: msg.parent_id,
                            role:                  msg.role,
                            content:               msg.content,
                            contentHash:           msg.content_hash,
                            ...(msg.role === 'system' && {
                                systemPromptId:        msg.system_prompt_id,
                                systemPromptTitle:     msg.system_prompt_title,
                                systemPromptIsDefault: msg.is_default
                            }),
                            ...(msg.role === 'assistant' && {
                                model:            msg.model,
                                temperature:      msg.temperature,
                                topP:             msg.top_p,
                                reasoningEffort:  msg.reasoning_effort,
                                verbosity:        msg.verbosity,
                                tools:            msg.tools,
                                reasoningContent: msg.reasoning_content,
                                signature:        msg.signature,
                                toolUses:         msg.tool_uses,
                                usage:            msg.usage,
                                raw:              msg.raw
                            })
                        }))
                    }
                }
            })
        }

        // Generate embeddings for new content (non-blocking)
        generateAnyNewEmbeddings(messages_with_hashes)

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

        saved_chat = formatForAPI(saved_chat)

        return json({ saved_chat }, { status: 201 })
    } catch (error) {
        console.error('Error saving chat:', error)
        return json({ message: 'Failed to save chat' }, { status: 500 })
    }
}

const generateAnyNewEmbeddings = async (messages) => {
    if (env.NODE_ENV === 'test') return

    try {
        const all_hashes = [...new Set(messages.filter(m => !!m.content_hash).map(m => m.content_hash))]

        if (all_hashes.length === 0) return

        const existing = await prisma.embedding.findMany({
            where: { contentHash: { in: all_hashes } },
            select: { contentHash: true }
        })
        const existing_hashes = new Set(existing.map(e => e.contentHash))

        const new_messages = messages.filter(m => 
            m.content_hash && !existing_hashes.has(m.content_hash)
        )
        if (new_messages.length === 0) return

        const texts      = new_messages.map(m => m.content),
              embeddings = await generateEmbeddings(texts)

        for (let i = 0; i < new_messages.length; i++) {
            const embedding = embeddings[i]
            if (!embedding) continue
            await saveEmbedding(new_messages[i].content_hash, embedding)
        }
    } catch (error) {
        console.error('🧩–❌ Error generating embeddings:', error)
    }
}
