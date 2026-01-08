import { env } from '$env/dynamic/private'
//
//  use SvelteKit's `fetch` (as `internal_fetch`) for mock endpoints in tests
//  use `fetch` for external API calls, otherwise you can get CORS errors
//
export const POST = async ({ request, fetch: internal_fetch }) => {
    let { messages, options } = await request.json()

    const using_cache = !!options.cache_id

    // When using cache, messages[0] is system prompt and messages[1] is first user message
    // which are already cached, so we only need messages from index 2 onwards
    const messages_to_include = using_cache ? messages.slice(2) : messages.slice(1)

    let contents = []

    if (messages_to_include.length === 0) {
        contents.push({
            role:  'user',
            parts: [{ text: "Please complete the task." }]
        })
    }

    messages_to_include.forEach(message => {
        contents.push({
            role:  message.role === 'assistant' ? 'model': 'user',
            parts: [{ text: message.content }]
        })
    })

    const headers = new Headers({
        'Content-Type': 'application/json'
    })

    let body = {
        generationConfig: {
            thinkingConfig: {
                includeThoughts: true
            },
            temperature: options.temperature,
            topP:        options.top_p
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
        ],
        contents
    }

    if (using_cache) {
        body.cachedContent = options.cache_id
    } else {
        body.systemInstruction = {
            role:  'system',
            parts: [{ text: messages[0]?.content }]
        }
    }

    if (options.tools?.length > 0) {
        body.tools = []

        options.tools.forEach(tool => {
            if (tool.name === 'google_search') {
                body.tools.push({
                    google_search: {}
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
        return internal_fetch('/mock/ai/chat/google', {
            method: 'POST',
            body
        })
    }
    
    return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${options.model.id}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers,
        body
    })
}
