import { env } from '$env/dynamic/private'
//
//  use SvelteKit's `fetch` (as `internal_fetch`) for mock endpoints in tests
//  use `fetch` for external API calls, otherwise you can get CORS errors
//
export const POST = async ({ request, fetch: internal_fetch }) => {
    let { messages, options } = await request.json()

    if (options.thinking_budget) {
        options.top_p           = 1
        options.temperature     = 1
        //  1024 is the minimum; the API request will fail otherwise
        if (options.thinking_budget === 1000) options.thinking_budget = 1024
    }

    let long_first_message = messages[1]?.content.length > 2000

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content, reasoning_content, signature }, i) => {
        const message = {
            role,
            content: [{
                type: 'text',
                text: content
            }]
        }
        //
        //  always pass back all thinking blocks:
        //  https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#preserving-thinking-blocks
        //
        if (reasoning_content) {
            message.content.push({
                type:     'thinking',
                thinking: reasoning_content,
                signature
            })
        }
        //
        //  set a cache breakpoint on the first assistant message if the
        //  first user message contains e.g. a long article, else set
        //  breakpoints on the last and second-to-last assistant messages
        //
        if (long_first_message) {
            if (i === 2 || i === messages.length - 1) {
                message.content[0].cache_control = { type: 'ephemeral' }
            }
        } else {
            if (i === messages.length - 1 || i === messages.length - 3) {
                message.content[0].cache_control = { type: 'ephemeral' }
            }
        }

        return message
    })

    const headers = new Headers({
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-beta':    'prompt-caching-2024-07-31,mcp-client-2025-04-04',
        'x-api-key':         env.ANTHROPIC_API_KEY
    })

    let body = {
        model:       options.model,
        temperature: options.temperature,
        top_p:       options.top_p,
        stream:      true,
        system:      [{
            type:          'text',
            text:          messages[0]?.content[0]?.text,
            cache_control: { type: 'ephemeral' }
        }],
        messages:    messages.slice(1),
        max_tokens:  4096 + (options.thinking_budget || 0),
    }

    if (options.thinking_budget) {
        body.thinking = { type: 'enabled', budget_tokens: options.thinking_budget }
    }

    if (options.tools?.length > 0) {
        body.tools       = []
        body.mcp_servers = []

        options.tools.forEach(tool => {
            if (tool.name === 'web_search' && tool.max_uses > 0) {
                body.tools.push({
                    type:     'web_search_20250305',
                    name:     'web_search',
                    max_uses: tool.max_uses
                })
            }
            if (tool.name === 'exa_search') {
                body.mcp_servers.push({
                    type: 'url',
                    name: 'exa_search',
                    url:  'https://mcp.exa.ai/mcp?exaApiKey=' + env.EXA_API_KEY
                })
            }
        })
    }

    body = JSON.stringify(body)

    if (env.NODE_ENV === 'test') {
        //
        //  Playwright doesn't support streaming endpoints
        //  so we need to mock this ourselves :/
        //
        return internal_fetch('/mock/ai/chat/anthropic', {
            method: 'POST',
            body
        })
    }

    return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body
    })
}
