import cl100k_base from 'tiktoken/encoders/cl100k_base.json' assert { type: 'json' }
import { Tiktoken } from 'tiktoken/lite'
import { getAIReply, getAIReasoning } from './prompt-map'

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const checkInterruption = async () => {
    if (global.isSetupInterrupted) process.exit(130) // exit code for Ctrl+C
}

export const process = (messages) => {
    let prompt = messages[messages.length - 1].content

    let is_delay_test = false,
        is_slow_test  = false

    if (prompt.startsWith('[DELAY] ')) {
        prompt        = prompt.replace('[DELAY] ', '')
        is_delay_test = true
    }

    if (prompt.startsWith('[SLOW] ')) {
        prompt       = prompt.replace('[SLOW] ', '')
        is_slow_test = true
    }

    const reply     = getAIReply(prompt),
          reasoning = getAIReasoning(prompt)

    const { input_tokens, output_tokens, reasoning_tokens } = getUsage(messages, reply, reasoning)

    return { prompt, reply, reasoning, input_tokens, output_tokens, reasoning_tokens, is_delay_test, is_slow_test }
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
