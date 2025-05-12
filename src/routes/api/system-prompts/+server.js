import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const GET = async () => {
    try {
        const data = await prisma.systemPrompt.findMany({
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return json(data, { status: 200 })
    } catch (error) {
        console.error('Error fetching system prompts:', error)
        return json({ message: 'Failed to fetch system prompts' }, { status: 500 })
    }
}
