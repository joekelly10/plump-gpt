import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma-client/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import PocketBase from 'pocketbase'

const pool    = new pg.Pool({ connectionString: process.env.DATABASE_URL }),
      adapter = new PrismaPg(pool),
      prisma  = new PrismaClient({ adapter })
const pb = new PocketBase('http://127.0.0.1:1336')

async function migrate() {
    try {
        console.log('Migrating system prompts...')

        const systemPrompts = await pb.collection('system_prompts').getFullList()
        console.log(`Found ${systemPrompts.length} system prompts to migrate`)

        for (const prompt of systemPrompts) {
            await prisma.systemPrompt.create({
                data: {
                    id:        prompt.id,
                    message:   prompt.message,
                    title:     prompt.title,
                    active:    prompt.active,
                    default:   prompt.default,
                    createdAt: new Date(prompt.created),
                    updatedAt: new Date(prompt.updated)
                }
            })
            console.log(`Migrated system prompt: ${prompt.title}`)
        }

        console.log('\nMigrating chats...')

        const chats = await pb.collection('chats').getFullList()
        console.log(`Found ${chats.length} chats to migrate`)

        for (const chat of chats) {
            console.log(`Migrating chat ${chat.id}...`)

            // strip provisional from fork objects as it should never have been persisted in the first place
            const forks = chat.forks.map(fork => ({
                message_ids: fork.message_ids,
                forked_at:   fork.forked_at
            }))

            // Create new chat in Postgres
            const newChat = await prisma.chat.create({
                data: {
                    id:         chat.id,
                    createdAt:  new Date(chat.created),
                    updatedAt:  new Date(chat.updated),
                    forks:      forks,
                    activeFork: chat.active_fork,
                    stars:      chat.stars || [],
                    highlights: chat.highlights || []
                }
            })

            // Process messages
            const messages = chat.messages || []
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i]
                
                if (message.role === 'system') {
                    await prisma.message.create({
                        data: {
                            chronologicalId:       0,
                            role:                  'system',
                            content:               message.content,
                            systemPromptId:        message.system_prompt_id,
                            systemPromptTitle:     message.system_prompt_title,
                            systemPromptIsDefault: message.is_default || false,
                            createdAt:             new Date(chat.updated),
                            updatedAt:             new Date(chat.updated),
                            chatId:                newChat.id
                        }
                    })
                } else if (message.role === 'user') {
                    await prisma.message.create({
                        data: {
                            chronologicalId:       i,
                            chronologicalParentId: message.parent_id,
                            role:                  message.role,
                            content:               message.content,
                            createdAt:             new Date(chat.updated),
                            updatedAt:             new Date(chat.updated),
                            chatId:                newChat.id
                        }
                    })
                } else if (message.role === 'assistant') {
                    await prisma.message.create({
                        data: {
                            chronologicalId:       i,
                            chronologicalParentId: message.parent_id,
                            role:                  message.role,
                            content:               message.content,
                            reasoningContent:      message.reasoning_content,
                            model:                 message.model || {},
                            temperature:           message.temperature,
                            topP:                  message.top_p,
                            usage:                 message.usage || {},
                            createdAt:             new Date(message.timestamp || chat.updated),
                            updatedAt:             new Date(message.timestamp || chat.updated),
                            chatId:                newChat.id
                        }
                    })
                }
            }
            console.log(`Successfully migrated chat ${chat.id}`)
        }

        console.log('Migration completed successfully!')
    } catch (error) {
        console.error('Migration failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

migrate() 