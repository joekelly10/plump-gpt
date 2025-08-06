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
        Authorization: 'Bearer ' + env.OPENAI_API_KEY
    })

    let body = {
        model:       options.model.id,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        store:       false,
        input:       messages
    }

    if (options.model.is_reasoner) {
        delete body.temperature
        delete body.top_p

        body.reasoning = {
            effort:  options.reasoning_effort ?? 'medium',
            summary: options.reasoning_summary ?? 'detailed'
        }
    }

    if (options.tools?.length > 0) {
        body.tools = []

        options.tools.forEach(tool => {
            if (tool.name === 'web_search') {
                let tool = { type: 'web_search_preview' }
                //
                //  Context size configuration is not supported for
                //  o3, o3-pro, o4-mini, and deep research models
                //
                if (!['o3', 'o3-pro', 'o4-mini'].includes(options.model.id)) {
                    tool.search_context_size = tool.search_context_size ?? 'low'
                }
                body.tools.push(tool)
            }
        })
    }

    body = JSON.stringify(body)

    if (env.NODE_ENV === 'test') {
        //
        //  Playwright doesn't support streaming endpoints
        //  so we need to mock this ourselves :/
        //
        return internal_fetch('/mock/ai/chat/open-ai', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers,
        body
    })
}
