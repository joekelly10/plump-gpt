export const messageStartObject = () => ({
    id:    '13333337-1337-1337-1337-133333333337',
    type:  'message-start',
    delta: {
        message: {
            role:       'assistant',
            content:    [],
            tool_plan:  '',
            tool_calls: [],
            citations:  []
        }
    }
})

export const contentStartObject = () => ({
    type: 'content-start',
    index: 0,
    delta: {
        message: {
            content: {
                type: 'text',
                text: ''
            }
        }
    }
})

export const contentDeltaObject = (content) => ({
    type: 'content-delta',
    index: 0,
    delta: {
        message: {
            content: {
                text: content
            }
        }
    }
})

export const contentEndObject = () => ({
    type: 'content-end',
    index: 0
})

export const messageEndObject = (input_tokens = 0, output_tokens = 0) => ({
    type: 'message-end',
    delta: {
        finish_reason: 'COMPLETE',
        usage: {
            billed_units: {
                input_tokens:  input_tokens,
                output_tokens: output_tokens
            },
            tokens: {
                input_tokens:  input_tokens,
                output_tokens: output_tokens
            }
        }
    }
}) 