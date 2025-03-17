import { ANTHROPIC_API_KEY } from '$env/static/private'

export const POST = async ({ request }) => {
    let { messages, options } = await request.json()

    let long_first_message = messages[1]?.content.length > 2000

    // strip all properties except `role` + `content` else you get a 400
    messages = messages.map(({ role, content }, i) => {
        const message = {
            role,
            content: [{
                type: 'text',
                text: content
            }]
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
        'anthropic-beta':    'prompt-caching-2024-07-31',
        'x-api-key':         ANTHROPIC_API_KEY
    })

    const body = JSON.stringify({
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
        max_tokens:  4096
    })

    return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body
    })
}
