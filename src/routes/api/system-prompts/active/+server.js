import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const GET = async () => {
    try {
        const active_prompt = await prisma.systemPrompt.findFirst({
            where: {
                active: true
            }
        })

        return json(active_prompt, { status: 200 })
    } catch (error) {
        console.error('Error fetching active system prompt:', error)
        return json({ message: 'Failed to fetch active system prompt' }, { status: 500 })
    }
}
