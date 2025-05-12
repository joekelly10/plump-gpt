import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const GET = async () => {
    try {
        const default_prompt = await prisma.systemPrompt.findFirst({
            where: {
                default: true
            }
        })

        return json(default_prompt, { status: 200 })
    } catch (error) {
        console.error('Error fetching default system prompt:', error)
        return json({ message: 'Failed to fetch default system prompt' }, { status: 500 })
    }
}
