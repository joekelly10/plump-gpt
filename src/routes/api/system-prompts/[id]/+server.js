import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const DELETE = async ({ params }) => {
    try {
        // default prompt must not be deleted
        const default_prompt = await prisma.systemPrompt.findFirst({
            where: {
                default: true
            }
        })

        if (default_prompt.id === params.id) {
            return json({ message: 'Cannot delete default system prompt' }, { status: 400 })
        }

        // if we're deleting the active prompt, make the default prompt active
        const active_prompt = await prisma.systemPrompt.findFirst({
            where: {
                active: true
            }
        })

        if (active_prompt?.id === params.id) {
            await prisma.systemPrompt.update({
                where: { id: default_prompt.id },
                data:  { active: true }
            })
        }

        // delete the prompt
        await prisma.systemPrompt.delete({
            where: { id: params.id }
        })

        return new Response(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting system prompt:', error)
        return json({ message: 'Failed to delete system prompt' }, { status: 500 })
    }
}
