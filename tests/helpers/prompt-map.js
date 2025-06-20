import { basic_prompt, basic_reply } from '$tests/mock/prompts/basic_reply'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '$tests/mock/prompts/basic_reasoning'
import { scroll_prompt, scroll_reply, scroll_prompt_2, scroll_reply_2, scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '$tests/mock/prompts/autoscroll'
import { persistence_prompt, persistence_reply } from '$tests/mock/prompts/persistence'
import { send_immediately_prompt, send_immediately_reply } from '$tests/mock/prompts/send_immediately'
import { delay_prompt, delay_reply, controls_prompt, controls_reply, controls_prompt_2, controls_reply_2, slow_prompt, slow_reply } from '$tests/mock/prompts/messages'

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
        case scroll_prompt:
            reply = scroll_reply
            break
        case scroll_prompt_2:
            reply = scroll_reply_2
            break
        case scroll_reasoning_prompt:
            reply = scroll_reasoning_reply
            break
        case delay_prompt:
            reply = delay_reply
            break
        case controls_prompt:
            reply = controls_reply
            break
        case controls_prompt_2:
            reply = controls_reply_2
            break
        case slow_prompt:
            reply = slow_reply
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
