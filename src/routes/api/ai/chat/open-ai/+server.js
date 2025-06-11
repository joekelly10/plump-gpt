import { env } from '$env/dynamic/private'

export const POST = async ({ request, fetch }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + env.OPENAI_API_KEY
    })

    const body = JSON.stringify({
        model:          options.model,
        temperature:    options.temperature,
        top_p:          options.top_p,
        stream:         true,
        stream_options: { include_usage: true },
        messages:       messages
    })

    // Playwright doesn't support streaming endpoints
    // so we need to mock this ourselves :/
    if (env.NODE_ENV === 'test') {
        return fetch('/mock/ai/chat/open-ai', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
