import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const POST = async ({ request }) => {
    try {
        const data = await request.formData(),
              file = data.get('avatar')

        if (!file || !(file instanceof File)) {
            return json({ error: 'No file uploaded' }, { status: 400 })
        }

        if (!file.type.startsWith('image/')) {
            return json({ error: 'Only image files are allowed' }, { status: 400 })
        }

        const buffer   = Buffer.from(await file.arrayBuffer())
        const hash     = crypto.createHash('sha256').update(buffer).digest('hex')
        const ext      = file.name.split('.').pop().toLowerCase()
        const file_name = `${hash}.${ext}`

        const directory = env.DOCKER_ENV === 'true'
            ? path.resolve('/app/uploads/avatars')
            : path.resolve('uploads/avatars')

        const file_path = path.join(directory, file_name)

        await fs.mkdir(directory, { recursive: true })        
        await fs.writeFile(file_path, buffer)
        
        const href = `/uploads/avatars/${file_name}`

        return json({ href }, { status: 201 })
    } catch (error) {
        console.error('Error uploading avatar:', error)
        return json({ error: 'Avatar upload failed' }, { status: 500 })
    }
}
