import { Tiktoken } from 'tiktoken/lite'
import cl100k_base from 'tiktoken/encoders/cl100k_base.json' assert { type: 'json' }

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const checkInterruption = async () => {
    if (global.isSetupInterrupted) process.exit(130) // exit code for Ctrl+C
}

export const wordsFrom = (text) => {
    return text.split(' ').map((word, i, arr) => word + (i === arr.length - 1 ? '' : ' '))
}

export const getUsage = (messages, ai_response, ai_reasoning = '') => {
    let input_tokens     = 0,
        reasoning_tokens = 0,
        output_tokens    = 0

    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
    )

    for (const message of messages) {
        input_tokens += encoding.encode(message.content).length
    }

    reasoning_tokens = encoding.encode(ai_reasoning).length
    output_tokens    = encoding.encode(ai_response).length

    encoding.free()

    return { input_tokens, reasoning_tokens, output_tokens }
}
