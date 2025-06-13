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
        thoughtsTokenCount: reasoning_tokens
    },
    modelVersion: model,
    responseId:   'goog-1337'
})
