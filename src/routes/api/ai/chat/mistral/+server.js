import { env } from '$env/dynamic/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + env.MISTRAL_API_KEY
    })

    const body = JSON.stringify({
        model:       options.model,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        messages:    messages
    })

    return fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
