import { env } from '$env/dynamic/private'
import { json } from '@sveltejs/kit'

export const POST = async ({ request }) => {
    const { system_prompt, user_message, model_id, ttl_mins = 5 } = await request.json()

    const headers = new Headers({
        'Content-Type': 'application/json'
    })

    const body = JSON.stringify({
        model: `models/${model_id}`,
        systemInstruction: {
            role:  'system',
            parts: [{ text: system_prompt }]
        },
        contents: [
            {
                role:  'user',
                parts: [{ text: user_message }]
            }
        ],
        ttl: `${ttl_mins*60}s`
    })

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers,
            body
        })

        if (response.ok) {
            const data = await response.json()
            console.log('🗄️–✅ Cache created.')
            return json(data, { status: 201 })
        } else {
            const error = await response.json()
            console.error('🗄️–❌ Cache creation failed:', error)
            return json({ error: error.error?.message || 'Failed to create cache' }, { status: response.status })
        }
    } catch (error) {
        console.error('🗄️–❌ Cache creation error:', error)
        return json({ error: error.message }, { status: 500 })
    }
}
