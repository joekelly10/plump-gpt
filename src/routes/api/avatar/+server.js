import { json } from '@sveltejs/kit'

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

        const buffer = Buffer.from(await file.arrayBuffer()),
              href   = `data:${file.type};base64,${buffer.toString('base64')}`

        return json({ href }, { status: 201 })
    } catch (error) {
        console.error('Error uploading avatar:', error)
        return json({ error: 'Avatar upload failed' }, { status: 500 })
    }
}
