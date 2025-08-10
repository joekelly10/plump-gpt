import { env } from '$env/dynamic/private'
//
//  use SvelteKit's `fetch` (as `internal_fetch`) for mock endpoints in tests
//  use `fetch` for external API calls, otherwise you can get CORS errors
//
export const POST = async ({ request, fetch: internal_fetch }) => {
    let { messages, options } = await request.json()

    const input = messages.map(msg => {
        if (msg.role === 'assistant' && msg.raw?.open_ai?.response) {
            let content = []

            const output       = msg.raw.open_ai.response.output,
                  message_item = output.find(item => item.type === 'message')

            content.push({
                type: 'output_text',
                text: message_item.content[0].text
            })

            return {
                id:      message_item.id,
                role:    'assistant',
                content: content
            }
        } else {
            return {
                role:    msg.role,
                content: msg.content
            }
        }
    })

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
        input:       input
    }

    if (options.model.is_reasoner) {
        delete body.temperature
        delete body.top_p

        body.reasoning = {
            effort:  options.reasoning_effort ?? 'minimal',
            summary: options.reasoning_summary ?? 'detailed'
        }

        body.text = {
            verbosity: options.verbosity ?? 'medium'
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
