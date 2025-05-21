import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'
import fs from 'fs/promises'
import path from 'path'

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

        const buffer = await file.arrayBuffer()

        const directory = env.DOCKER_ENV === 'true'
            ? path.resolve('/app/uploads/avatars')    // Docker volume
            : path.resolve('static/img/avatars')      // Local dev
        
        const base_path = env.DOCKER_ENV === 'true' 
            ? '/uploads/avatars/' 
            : '/img/avatars/'

        const timestamp      = Date.now(),
              file_extension = file.type.split('/')[1],
              file_name      = `${timestamp}.${file_extension}`,
              file_path      = path.join(directory, file_name)

        await fs.mkdir(directory, { recursive: true })        
        await fs.writeFile(file_path, Buffer.from(buffer))
        
        const href = `${base_path}${file_name}`

        return json({ href }, { status: 201 })
    } catch (error) {
        console.error('Error uploading avatar:', error)
        return json({ error: 'Avatar upload failed' }, { status: 500 })
    }
}
