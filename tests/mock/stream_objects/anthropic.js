export const messageStartObject = (model, input_tokens = 0) => ({
    type: "message_start",
    message: {
        id:            "msg_1337",
        type:          "message",
        role:          "assistant",
        model:         model,
        content:       [],
        stop_reason:   null,
        stop_sequence: null,
        usage:         {
            input_tokens:                341,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens:     0,
            output_tokens:               1,
            service_tier:                "standard"
        }
    }
})

export const thinkingStartObject = () => ({
    type:  "content_block_start",
    index: 0,
    content_block: {
        type:      "thinking",
        thinking:  "",
        signature: ""
    }
})

export const thinkingDeltaObject = (content) => ({
    type:  "content_block_delta",
    index: 0,
    delta: {
        type:     "thinking_delta",
        thinking: content
    }
})

export const signatureDeltaObject = () => ({
    type:  "content_block_delta",
    index: 0,
    delta: {
        type: "signature_delta",
        signature: "anthropic1says2this3is4totally5legit6and7properly8reasoned9and0stuff"
    }
})

export const textStartObject = () => ({
    type:  "content_block_start",
    index: 0,
    content_block: {
        type: "text",
        text: ""
    }
})

export const textDeltaObject = (content) => ({
    type:  "content_block_delta",
    index: 0,
    delta: {
        type: "text_delta",
        text: content
    }
})

export const contentBlockStopObject = () => ({
    type:  "content_block_stop",
    index: 0
})

export const messageDeltaObject = (output_tokens = 0) => ({
    type: "message_delta",
    delta: {
        stop_reason: "end_turn",
        stop_sequence: null
    },
    usage: {
        output_tokens: output_tokens
    }
})

export const messageStopObject = () => ({
    type: "message_stop"
})
