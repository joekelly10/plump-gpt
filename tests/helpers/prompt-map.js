import { basic_prompt, basic_reply } from '$tests/mock/prompts/basic_reply'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '$tests/mock/prompts/basic_reasoning'
import { scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '$tests/mock/prompts/scroll_reasoning'
import { persistence_prompt, persistence_reply } from '$tests/mock/prompts/persistence'
import { send_immediately_prompt, send_immediately_reply } from '$tests/mock/prompts/send_immediately'

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
        case send_immediately_prompt:
            reply = send_immediately_reply
            break
        case scroll_reasoning_prompt:
            reply = scroll_reasoning_reply
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
            reasoning = basic_reasoning_content
            break
        case scroll_reasoning_prompt:
            reasoning = scroll_reasoning_content
            break
        default:
            reasoning = ''
    }

    return reasoning
}
