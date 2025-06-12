import { env } from '$env/dynamic/private'
//
//  use SvelteKit's `fetch` (as `internal_fetch`) for mock endpoints in tests
//  use `fetch` for external API calls, otherwise you can get CORS errors
//
export const POST = async ({ request, fetch: internal_fetch }) => {
    let { messages, options } = await request.json()

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }) => ({ role, content }))

    const headers = new Headers({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY
    })

    const body = JSON.stringify({
        model:          options.model,
        temperature:    options.temperature,
        top_p:          options.top_p,
        stream:         true,
        stream_options: { include_usage: true },
        messages:       messages
    })

    if (env.NODE_ENV === 'test') {
        //
        //  Playwright doesn't support streaming endpoints
        //  so we need to mock this ourselves :/
        //
        return internal_fetch('/mock/ai/chat/deepseek', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
