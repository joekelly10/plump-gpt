import { env } from '$env/dynamic/private'
//
//  use SvelteKit's `fetch` (as `internal_fetch`) for mock endpoints in tests
//  use `fetch` for external API calls, otherwise you can get CORS errors
//
export const POST = async ({ request, fetch: internal_fetch }) => {
    let { messages, options } = await request.json()

    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization:  'Bearer ' + env.COHERE_API_KEY
    })

    const body = JSON.stringify({
        model:       options.model.id,
        temperature: options.temperature,
        p:           options.top_p > 0.99 ? 0.99 : options.top_p,
        stream:      true,
        messages:    messages
    })

    if (env.NODE_ENV === 'test') {
        //
        //  Playwright doesn't support streaming endpoints
        //  so we need to mock this ourselves :/
        //
        return internal_fetch('/mock/ai/chat/cohere', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.cohere.com/v2/chat', {
        method: 'POST',
        headers,
        body
    })
}
