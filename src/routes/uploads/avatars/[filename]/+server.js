import { env } from '$env/dynamic/private'
import { error } from '@sveltejs/kit'
import fs from 'fs/promises'
import path from 'path'

export const GET = async ({ params }) => {
    try {
        const filename       = params.filename,
              file_extension = filename.split('.').pop().toLowerCase()

        const file_path = env.DOCKER_ENV === 'true'
            ? path.resolve('/app/uploads/avatars', filename)
            : path.resolve('uploads/avatars', filename)

        const file = await fs.readFile(file_path)

        const contentType = {
            'png':  'image/png',
            'jpg':  'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif':  'image/gif',
            'webp': 'image/webp'
        }[file_extension] || 'application/octet-stream'
        
        return new Response(file, {
            headers: {
                'Content-Type':  contentType,
                'Cache-Control': 'public, max-age=604800' // 1 week
            }
        })
    } catch (err) {
        throw error(404, 'Avatar not found')
    }
}
