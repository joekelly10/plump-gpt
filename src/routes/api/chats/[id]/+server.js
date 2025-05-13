import { json } from '@sveltejs/kit'
import { prisma } from '$lib/db/prisma'

export const DELETE = async ({ params }) => {
    try {
        // NB: all Messages get deleted automatically due to onDelete: Cascade
        await prisma.chat.delete({
            where: {
                id: params.id
            }
        })

        // Use the Response constructor directly instead of json helper
        return new Response(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting chat:', error)
        return json({ message: 'Failed to delete chat' }, { status: 500 })
    }
}
