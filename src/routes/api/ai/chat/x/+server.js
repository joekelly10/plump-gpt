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
        Authorization: 'Bearer ' + env.GROK_API_KEY
    })

    let body = {
        model:          options.model,
        temperature:    options.temperature,
        top_p:          options.top_p,
        stream:         true,
        stream_options: { include_usage: true },
        messages:       messages
    }

    if (options.tools?.length > 0) {
        options.tools.forEach(tool => {
            if (tool.name === 'x_search') {
                body.search_parameters = {
                    mode: 'on',
                    sources: [{
                        type:                'x',
                        post_view_count:     tool.post_view_count,
                        post_favorite_count: tool.post_favorite_count,
                        included_x_handles:  tool.included_x_handles,
                        excluded_x_handles:  tool.excluded_x_handles
                    }]
                }
            }
        })
    }

    body = JSON.stringify(body)

    if (env.NODE_ENV === 'test') {
        //
        //  Playwright doesn't support streaming endpoints
        //  so we need to mock this ourselves :/
        //
        return internal_fetch('/mock/ai/chat/x', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers,
        body
    })
}
