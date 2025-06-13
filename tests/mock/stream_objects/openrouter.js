export const startObject = (model) => ({
    id:       'gen-1333333337-123',
    provider: 'CheapInference Inc.',
    model:    model,
    object:   'chat.completion.chunk',
    created:  Date.now(),
    choices:  [{
        index: 0,
        delta: {
            role:    'assistant',
            content: '',
            refusal: null
        }, 
        finish_reason:        null,
        native_finish_reason: null,
        logprobs:             null
    }]
})

export const deltaReasoningObject = (model, reasoning_content) => ({
    id:       'gen-1333333337-123',
    provider: 'CheapInference Inc.',
    model:    model,
    object:   'chat.completion.chunk',
    created:  Date.now(),
    choices:  [{
        index:         0,
        delta:         {
            role:      'assistant',
            content:   '',
            reasoning: reasoning_content
        },
        finish_reason:        null,
        native_finish_reason: null,
        logprobs:             null
    }]
})

export const deltaObject = (model, content) => ({
    id:       'gen-1333333337-123',
    provider: 'CheapInference Inc.',
    model:    model,
    object:   'chat.completion.chunk',
    created:  Date.now(),
    choices:  [{
        index:         0,
        delta:         {
            role:      'assistant',
            content:   content,
            reasoning: null
        },
        finish_reason:        null,
        native_finish_reason: null,
        logprobs:             null
    }]
})

export const finishObject = (model, finish_reason = 'stop') => ({
    id:       'gen-1333333337-123',
    provider: 'CheapInference Inc.',
    model:    model,
    object:   'chat.completion.chunk',
    created:  Date.now(),
    choices:  [{
        index: 0,
        delta: {
            role:      'assistant',
            content:   null,
            reasoning: null
        },
        logprobs:             null,
        finish_reason:        finish_reason,
        native_finish_reason: finish_reason,
        logprobs:             null
    }]
})

export const usageObject = (model, input_tokens, output_tokens, reasoning_tokens = 0, cached_tokens = 0, cost = 0) => ({
    id:       'gen-1333333337-123',
    provider: 'CheapInference Inc.',
    model:    model,
    object:   'chat.completion.chunk',
    created:  Date.now(),
    choices:  [{
        index: 0,
        delta: {
            role:      'assistant',
            content:   null,
            reasoning: null
        },
        logprobs:             null,
        finish_reason:        null,
        native_finish_reason: null,
        logprobs:             null
    }],
    usage: {
        prompt_tokens:     input_tokens,
        completion_tokens: output_tokens,
        total_tokens:      input_tokens + output_tokens,
        cost:              cost,
        prompt_tokens_details: {
            cached_tokens: cached_tokens
        },
        cost_details: {
            upstream_inference_cost: null
        },
        completion_tokens_details: {
            reasoning_tokens: reasoning_tokens
        }
    }
})
