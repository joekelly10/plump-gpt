import { basic_prompt, basic_reply } from '$tests/mock/prompts/basic_reply'
import { basic_reasoning_prompt, basic_reasoning, basic_reasoning_reply } from '$tests/mock/prompts/basic_reasoning'
import { persistence_prompt, persistence_reply } from '$tests/mock/prompts/persistence'

export const getAIReply = (prompt) => {
    let reply

    switch (prompt) {
        case basic_prompt:
            reply = basic_reply
            break
        case basic_reasoning_prompt:
            reply = basic_reasoning_reply
            break
        case persistence_prompt:
            reply = persistence_reply
            break
        default:
            reply = '💩'
    }

    return reply
}

export const getAIReasoning = (prompt) => {
    let reasoning

    switch (prompt) {
        case basic_reasoning_prompt:
            reasoning = basic_reasoning
            break
        default:
            reasoning = ''
    }

    return reasoning
}
