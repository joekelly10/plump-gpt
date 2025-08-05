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

export const serverToolStartObject = () => ({
    type: "content_block_start",
    index: 0,
    content_block: {
        type:  "server_tool_use",
        id:    "srvtoolu_1337",
        name:  "web_search",
        input: {}
    }
})

export const serverToolDeltaObject = (content) => ({
    type:  "content_block_delta",
    index: 0,
    delta: {
        type:         "input_json_delta",
        partial_json: content
    }
})

export const mcpToolStartObject = (mcp_tool_name = 'web_search_exa', mcp_server_name = 'exa_search') => ({
    type: "content_block_start",
    index: 1,
    content_block: {
        type:        "mcp_tool_use",
        id:          "mcptoolu_1337",
        server_name: mcp_server_name,
        name:        mcp_tool_name,
        input:       {}
    }
})

export const mcpToolResultObject = (mcp_tool_name = 'web_search_exa', mcp_server_name = 'exa_search') => ({
    type: "content_block_start",
    index: 2,
    content_block: {
        type:        "mcp_tool_result",
        tool_use_id: "mcptoolu_1337",
        is_error:    false,
        content:     [
            {
                type: "text",
                text: "{\n  \"success\": true,\n  \"taskId\": \"01k1e4tnv9r650zzhjqdg3xejz\",\n  \"model\": \"exa-research-pro\",\n  \"instructions\": \"Research the thing.\",\n  \"outputSchema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"report\": {\n        \"description\": \"No output schema provided. Using default output: markdown report.\",\n        \"type\": \"string\"\n      }\n    },\n    \"required\": [\n      \"report\"\n    ],\n    \"additionalProperties\": false\n  },\n  \"message\": \"Deep research task started successfully with exa-research-pro model. IMMEDIATELY use deep_researcher_check with task ID '01k1e4tnv9r650zzhjqdg3xejz' to monitor progress. Keep checking every few seconds until status is 'completed' to get the research results.\",\n  \"nextStep\": \"Call deep_researcher_check with taskId: \\\"01k1e4tnv9r650zzhjqdg3xejz\\\"\"\n}"
            }
        ]
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
