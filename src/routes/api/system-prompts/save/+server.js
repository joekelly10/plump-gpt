import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const POST = async ({ request }) => {
    try {
        const { save_and_activate, deactivate } = await request.json()

        let prompt

        if (!save_and_activate.id) {
            // we are creating a new prompt, so 1st deactivate the old prompt
            await prisma.systemPrompt.update({
                where: { id: deactivate.id },
                data:  { active: false }
            })
            
            // create the new prompt
            prompt = await prisma.systemPrompt.create({
                data: {
                    title:   save_and_activate.title,
                    message: save_and_activate.message,
                    active:  true
                }
            })
        } else if (deactivate.id === save_and_activate.id) {
            // overwriting currently active prompt (so skip deactivation)
            prompt = await prisma.systemPrompt.update({
                where: { id: save_and_activate.id },
                data:  {
                    title:   save_and_activate.title,
                    message: save_and_activate.message,
                    active:  true
                }
            })
        } else {
            // switching active prompt (deactivate old, activate new)
            await prisma.systemPrompt.update({
                where: { id: deactivate.id },
                data:  { active: false }
            })
            
            prompt = await prisma.systemPrompt.update({
                where: { id: save_and_activate.id },
                data:  {
                    title:   save_and_activate.title,
                    message: save_and_activate.message,
                    active:  true
                }
            })
        }

        return json(prompt, { status: 201 })
    } catch (error) {
        console.error('Error saving system prompt:', error)
        return json({ message: 'Failed to save system prompt' }, { status: 500 })
    }
}
