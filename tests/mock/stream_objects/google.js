export const startObject = (model, input_tokens = 0) => ({
    candidates: [{
        content: {
            parts: [{
                text: ''
            }],
            role: 'model'
        }
    }],
    usageMetadata: {
        promptTokenCount: input_tokens,
        totalTokenCount:  input_tokens,
        promptTokensDetails: [{
            modality:   'TEXT',
            tokenCount: input_tokens
        }]
    },
    modelVersion: model,
    responseId:   'goog-1337'
})

export const partThoughtObject = (model, text = '', input_tokens = 0, output_tokens = 0) => ({
    candidates: [{
        content: {
            parts: [{
                text:    text,
                thought: true
            }],
            role: 'model'
        },
        safetyRatings: [
            {
                category:    'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE'
            }
        ]
    }],
    usageMetadata: {
        promptTokenCount: input_tokens,
        totalTokenCount:  input_tokens,
        promptTokensDetails: [{
            modality:   'TEXT',
            tokenCount: input_tokens
        }]
    },
    modelVersion: model,
    responseId:   'goog-1337'
})

export const partObject = (model, text = '', input_tokens = 0, output_tokens = 0) => ({
    candidates: [{
        content: {
            parts: [{
                text: text
            }],
            role: 'model'
        },
        safetyRatings: [
            {
                category:    'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE'
            }
        ]
    }],
    usageMetadata: {
        promptTokenCount: input_tokens,
        totalTokenCount:  input_tokens,
        promptTokensDetails: [{
            modality:   'TEXT',
            tokenCount: input_tokens
        }]
    },
    modelVersion: model,
    responseId:   'goog-1337'
})

export const finishObject = (model, text = '', input_tokens = 0, output_tokens = 0, reasoning_tokens = 0) => ({
    candidates: [{
        content: {
            parts: [{
                text: text
            }],
            role: 'model'
        },
        finishReason: 'STOP',
        index:        0,
        safetyRatings: [
            {
                category:    'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE'
            }
        ]
    }],
    usageMetadata: {
        promptTokenCount:     input_tokens,
        candidatesTokenCount: output_tokens,
        totalTokenCount:      input_tokens + output_tokens + reasoning_tokens,
        promptTokensDetails: [{
            modality:   'TEXT',
            tokenCount: input_tokens
        }],
        candidatesTokensDetails: [{
            modality:   'TEXT',
            tokenCount: output_tokens
        }],
        toolUsePromptTokenCount: 0,
        thoughtsTokenCount:      reasoning_tokens
    },
    modelVersion: model,
    responseId:   'goog-1337'
})

export const finishObjectWithToolUse = (model, text = '', input_tokens = 0, output_tokens = 0, reasoning_tokens = 0, tool_use_tokens = 0) => ({
    candidates: [{
        content: {
            parts: [{
                text: text
            }],
            role: 'model'
        },
        finishReason: 'STOP',
        index:        0,
        groundingMetadata: {
            searchEntryPoint: {
                renderedContent: ""
            },
            groundingChunks: [
                {
                    web: {
                        uri:   "https://www.google.com/search?q=weather+in+London",
                        title: "Weather information for locality: London"
                    }
                }
            ],
            groundingSupports: [
                {
                    segment: {
                        startIndex: 114,
                        endIndex:   140,
                        text:       "The humidity is about 71%."
                    },
                    groundingChunkIndices: [
                        0
                    ]
                },
                {
                    segment: {
                        startIndex: 141,
                        endIndex:   187,
                        text:       "There's basically no chance of rain right now."
                    },
                    groundingChunkIndices: [
                        0
                    ]
                },
                {
                    segment: {
                        startIndex: 315,
                        endIndex:   344,
                        text:       "There's a 10% chance of rain."
                    },
                    groundingChunkIndices: [
                        0
                    ]
                },
                {
                    segment: {
                        startIndex: 345,
                        endIndex:   494,
                        text:       "Looking ahead to Monday, expect partly cloudy skies with a high of 72°F (22°C) and a low of 54°F (12°C), and a 20% chance of rain during the day."
                    },
                    groundingChunkIndices: [
                        0
                    ]
                }
            ],
            webSearchQueries: [
                "weather in London"
            ]
        },
        safetyRatings: [
            {
                category:    'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE'
            },
            {
                category:    'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE'
            }
        ]
    }],
    usageMetadata: {
        promptTokenCount:     input_tokens,
        candidatesTokenCount: output_tokens,
        totalTokenCount:      input_tokens + output_tokens + reasoning_tokens,
        promptTokensDetails: [{
            modality:   'TEXT',
            tokenCount: input_tokens
        }],
        candidatesTokensDetails: [{
            modality:   'TEXT',
            tokenCount: output_tokens
        }],
        toolUsePromptTokenCount: tool_use_tokens,
        thoughtsTokenCount:      reasoning_tokens
    },
    modelVersion: model,
    responseId:   'goog-1337'
})
