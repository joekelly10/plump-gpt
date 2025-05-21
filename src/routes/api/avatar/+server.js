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
        
        const buffer    = await file.arrayBuffer(),
              directory = path.resolve('static/img'),
              file_path = path.join(directory, 'avatar.png')

        await fs.writeFile(file_path, Buffer.from(buffer))

        const timestamp = Date.now(),
              href      = `/img/avatar.png?t=${timestamp}`
        
        return json({ href }, { status: 201 })
    } catch (error) {
        console.error('Error uploading avatar:', error)
        return json({ error: 'Avatar upload failed' }, { status: 500 })
    }
}
