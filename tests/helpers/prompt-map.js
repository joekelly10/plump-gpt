import { basic_prompt, basic_reply } from '$tests/mock/prompts/basic_reply'
import { basic_reasoning_prompt, basic_reasoning, basic_reasoning_reply } from '$tests/mock/prompts/basic_reasoning'
import { persistence_prompt, persistence_reply } from '$tests/mock/prompts/persistence'

export const getAIReply = (prompt) => {
    let reply

    if (prompt === basic_prompt) {
        reply = basic_reply
    } else if (prompt === basic_reasoning_prompt) {
        reply = basic_reasoning_reply
    } else if (prompt === persistence_prompt) {
        reply = persistence_reply
    } else {
        reply = '💩'
    }

    return reply
}

export const getAIReasoning = (prompt) => {
    let reasoning = ''

    if (prompt === basic_reasoning_prompt) {
        reasoning = basic_reasoning
    }

    return reasoning
}
