const icon_mappings = {
    'claude-3-sonnet.png':   'claude-sonnet.png',
    'claude-3.7-sonnet.png': 'claude-sonnet.png',
    'claude-3-haiku.png':    'claude-haiku.png',
    'claude-3-opus.png':     'claude-opus.png',
    'grok-mini.png':         'grok-fast.png',
    'gpt-4o-mini.png':       'gpt-5-nano.png',
    'gpt-4o.png':            'gpt-5-mini.png',
    'gpt-4.1-nano.png':      'gpt-5-nano.png',
    'gpt-4.1-mini.png':      'gpt-5-mini.png',
    'gpt-4.1.png':           'gpt-5.png',
    'llama-3-light.png':     'llama-light.png',
    'llama-3-medium.png':    'llama-medium.png',
    'llama-3-heavy.png':     'llama-heavy.png'
}

export const migrateIfNeeded = (chats) => {
    chats.forEach(chat => {
        chat.messages.forEach(message => {
            if (message.role === 'assistant') {
                // usage is missing from oldest messages
                if (!message.usage) {
                    message.usage = {
                        cache_write_tokens: 0,
                        cache_read_tokens:  0,
                        input_tokens:       0,
                        output_tokens:      0
                    }
                    // temp + top_p weren't saved either
                    message.temperature = 0.4
                    message.top_p = 0.9
                }
                // cache_write_tokens and cache_read_tokens are missing from
                // usage objects before caching was introduced to the APIs
                if (message.usage.cache_write_tokens === undefined) {
                    message.usage = {
                        ...message.usage,
                        cache_write_tokens: 0,
                        cache_read_tokens:  message.usage.cache_read_tokens ?? 0
                    }
                }
                // map old icons to new
                if (icon_mappings[message.model.icon]) {
                    message.model.icon = icon_mappings[message.model.icon]
                }
            }
        })
    })

    return chats
}

