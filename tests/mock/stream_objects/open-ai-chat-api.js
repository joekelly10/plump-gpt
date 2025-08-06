//
//  Deprecated Open AI Chat Completions API
//
export const startObject = (model) => ({
    id:                 'chatcmpl-123',
    object:             'chat.completion.chunk',
    created:            Date.now(),
    model:              model,
    service_tier:       'default',
    system_fingerprint: 'fp_1337',
    choices: [{
        index: 0,
        delta: {
            role:    'assistant',
            content: '',
            refusal: null
        }, 
        logprobs:      null,
        finish_reason: null
    }],
    usage: null
})

export const deltaReasoningObject = (model, reasoning_content) => ({
    id:                 'chatcmpl-123',
    object:             'chat.completion.chunk',
    created:            Date.now(),
    model:              model,
    service_tier:       'default',
    system_fingerprint: 'fp_1337',
    choices: [{
        index:         0,
        delta:         { reasoning_content },
        logprobs:      null,
        finish_reason: null
    }],
    usage: null
})

export const deltaObject = (model, content) => ({
    id:                 'chatcmpl-123',
    object:             'chat.completion.chunk',
    created:            Date.now(),
    model:              model,
    service_tier:       'default',
    system_fingerprint: 'fp_1337',
    choices: [{
        index:         0,
        delta:         { content },
        logprobs:      null,
        finish_reason: null
    }],
    usage: null
})

export const finishObject = (model, finish_reason = 'stop') => ({
    id:                 'chatcmpl-123',
    object:             'chat.completion.chunk',
    created:            Date.now(),
    model:              model,
    service_tier:       'default',
    system_fingerprint: 'fp_1337',
    choices: [{
        index:         0,
        delta:         {},
        logprobs:      null,
        finish_reason: finish_reason
    }],
    usage: null
})

export const usageObject = (model, input_tokens, output_tokens, reasoning_tokens = 0, cached_tokens = 0) => ({
    id:                 'chatcmpl-123',
    object:             'chat.completion.chunk',
    created:            Date.now(),
    model:              model,
    service_tier:       'default',
    system_fingerprint: 'fp_1337',
    choices: [],
    usage: {
        prompt_tokens:         input_tokens,
        completion_tokens:     output_tokens,
        total_tokens:          input_tokens + output_tokens,
        prompt_tokens_details: {
            cached_tokens: cached_tokens,
            audio_tokens:  0
        },
        completion_tokens_details: {
            reasoning_tokens:           reasoning_tokens,
            audio_tokens:               0,
            accepted_prediction_tokens: 0,
            rejected_prediction_tokens: 0
        }
    }
})
