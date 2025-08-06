//
//  Open AI Responses API
//
export const createdObject = (model) => ({
    type:            'response.created',
    sequence_number: 0,
    response: {
        id:                   'resp_1337',
        object:               'response',
        created_at:           1754475155,
        status:               'in_progress',
        background:           false,
        error:                null,
        incomplete_details:   null,
        instructions:         null,
        max_output_tokens:    null,
        max_tool_calls:       null,
        model:                model,
        output:               [],
        parallel_tool_calls:  true,
        previous_response_id: null,
        prompt_cache_key:     null,
        reasoning:            {
            effort:  null,
            summary: null
        },
        safety_identifier: null,
        service_tier:      'auto',
        store:             false,
        temperature:       0.4,
        text:              {
            format: {
                type: 'text'
            }
        },
        tool_choice:  'auto',
        tools:        [],
        top_logprobs: 0,
        top_p:        0.9,
        truncation:   'disabled',
        usage:        null,
        user:         null,
        metadata:     {}
    }
})

export const inProgressObject = (model) => ({
    type:            'response.in_progress',
    sequence_number: 1,
    response:        {
        id:                   'resp_1337',
        object:               'response',
        created_at:           1754475155,
        status:               'in_progress',
        background:           false,
        error:                null,
        incomplete_details:   null,
        instructions:         null,
        max_output_tokens:    null,
        max_tool_calls:       null,
        model:                model,
        output:               [],
        parallel_tool_calls:  true,
        previous_response_id: null,
        prompt_cache_key:     null,
        reasoning:            {
            effort:  null,
            summary: null
        },
        safety_identifier: null,
        service_tier:      'auto',
        store:             false,
        temperature:       0.4,
        text:              {
            format: {
                type: 'text'
            }
        },
        tool_choice:  'auto',
        tools:        [],
        top_logprobs: 0,
        top_p:        0.9,
        truncation:   'disabled',
        usage:        null,
        user:         null,
        metadata:     {}
    }
})

export const outputItemAddedObject = (sequence_number = 2) => ({
    type:            'response.output_item.added',
    sequence_number: sequence_number,
    output_index:    0,
    item: {
        id:      'msg_133337',
        type:    'message',
        status:  'in_progress',
        content: [],
        role:    'assistant'
    }
})

export const contentPartAddedObject = (sequence_number = 3) => ({
    type:            'response.content_part.added',
    sequence_number: sequence_number,
    item_id:         'msg_133337',
    output_index:    0,
    content_index:   0,
    part: {
        type:        'output_text',
        annotations: [],
        logprobs:    [],
        text:        ''
    }
})

export const outputTextDeltaObject = (delta, sequence_number = 4) => ({
    type:            'response.output_text.delta',
    sequence_number: sequence_number,
    item_id:         'msg_133337',
    output_index:    0,
    content_index:   0,
    delta:           delta,
    logprobs:        [],
    obfuscation:     'g1DhAcJ1QtfBG'
})

export const outputTextDoneObject = (text, sequence_number = 5) => ({
    type:            'response.output_text.done',
    sequence_number: sequence_number,
    item_id:         'msg_133337',
    output_index:    0,
    content_index:   0,
    text:            text,
    logprobs:        []
})

export const contentPartDoneObject = (text, sequence_number = 6) => ({
    type:            'response.content_part.done',
    sequence_number: sequence_number,
    item_id:         'msg_133337',
    output_index:    0,
    content_index:   0,
    part: {
        type:        'output_text',
        annotations: [],
        logprobs:    [],
        text:        text
    }
})

export const outputItemDoneObject = (text, sequence_number = 7) => ({
    type:            'response.output_item.done',
    sequence_number: sequence_number,
    output_index:    0,
    item: {
        id:      'msg_133337',
        type:    'message',
        status:  'completed',
        role:    'assistant',
        content: [
            {
                type:        'output_text',
                annotations: [],
                logprobs:    [],
                text:        text
            }
        ]
    }
})

export const reasoningOutputItemAddedObject = (sequence_number = 2) => ({
    type:            'response.output_item.added',
    sequence_number: sequence_number,
    output_index:    0,
    item: {
        id:      'rs_133336',
        type:    'reasoning',
        summary: []
    }
})

export const reasoningSummaryPartAddedObject = (sequence_number = 3) => ({
    type:            'response.reasoning_summary_part.added',
    sequence_number: sequence_number,
    item_id:         'rs_133336',
    output_index:    0,
    summary_index:   0,
    part: {
        type: 'summary_text',
        text: ''
    }
})

export const reasoningSummaryTextDeltaObject = (delta, sequence_number = 4) => ({
    type:            'response.reasoning_summary_text.delta',
    sequence_number: sequence_number,
    item_id:         'rs_133336',
    output_index:    0,
    summary_index:   0,
    delta:           delta,
    obfuscation:     'PuTj28QuKD'
})

export const reasoningSummaryTextDoneObject = (text, sequence_number = 5) => ({
    type:            'response.reasoning_summary_text.done',
    sequence_number: sequence_number,
    item_id:         'rs_133336',
    output_index:    0,
    summary_index:   0,
    text:            text
})

export const reasoningSummaryPartDoneObject = (text, sequence_number = 6) => ({
    type:            'response.reasoning_summary_part.done',
    sequence_number: sequence_number,
    item_id:         'rs_133336',
    output_index:    0,
    summary_index:   0,
    part: {
        type: 'summary_text',
        text: text
    }
})

export const reasoningOutputItemDoneObject = (text, sequence_number = 7) => ({
    type:            'response.output_item.done',
    sequence_number: sequence_number,
    output_index:    0,
    item: {
        id:      'rs_133336',
        type:    'reasoning',
        summary: [
            {
                type: 'summary_text',
                text: text
            }
        ]
    }
})

export const completedObject = (model, text, input_tokens = 0, output_tokens = 0, reasoning_tokens = 0) => ({
    type:            'response.completed',
    sequence_number: 25,
    response:        {
        id:                   'resp_1337',
        object:               'response',
        created_at:           1754475155,
        status:               'completed',
        background:           false,
        error:                null,
        incomplete_details:   null,
        instructions:         null,
        max_output_tokens:    null,
        max_tool_calls:       null,
        model:                model,
        output:               [
            {
                id:      'msg_133337',
                type:    'message',
                status:  'completed',
                role:    'assistant',
                content: [
                    {
                        type:        'output_text',
                        annotations: [],
                        logprobs:    [],
                        text:        text
                    }
                ]
            }
        ],
        parallel_tool_calls:  true,
        previous_response_id: null,
        prompt_cache_key:     null,
        reasoning:            {
            effort:  null,
            summary: null
        },
        safety_identifier: null,
        service_tier:      'default',
        store:             false,
        temperature:       0.4,
        text:              {
            format: {
                type: 'text'
            }
        },
        tool_choice:  'auto',
        tools:        [],
        top_logprobs: 0,
        top_p:        0.9,
        truncation:   'disabled',
        usage:        {
            input_tokens: input_tokens,
            input_tokens_details: {
                cached_tokens: 0
            },
            output_tokens: output_tokens,
            output_tokens_details: {
                reasoning_tokens: reasoning_tokens
            },
            total_tokens: input_tokens + output_tokens
        },
        user:         null,
        metadata:     {}
    }
})
