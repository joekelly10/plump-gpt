import { basic_prompt, basic_reply } from '../mock/prompts/basic_reply'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '../mock/prompts/basic_reasoning'
import { scroll_prompt, scroll_reply, scroll_prompt_2, scroll_reply_2, scroll_reasoning_prompt, scroll_reasoning_content, scroll_reasoning_reply } from '../mock/prompts/autoscroll'
import { persistence_prompt, persistence_reply } from '../mock/prompts/persistence'
import { send_immediately_prompt, send_immediately_reply } from '../mock/prompts/send_immediately'
import { short_reply_prompt, short_reply, medium_reply_prompt, medium_reply, long_reply_prompt, long_reply } from '../mock/prompts/messages'

export const getAIReply = (prompt) => {
    switch (prompt) {
        case basic_prompt:            return basic_reply
        case basic_reasoning_prompt:  return basic_reasoning_reply
        case persistence_prompt:      return persistence_reply
        case send_immediately_prompt: return send_immediately_reply
        case scroll_prompt:           return scroll_reply
        case scroll_prompt_2:         return scroll_reply_2
        case scroll_reasoning_prompt: return scroll_reasoning_reply
        case short_reply_prompt:      return short_reply
        case medium_reply_prompt:     return medium_reply
        case long_reply_prompt:       return long_reply
        default:                      return '💩'
    }
}

export const getAIReasoning = (prompt) => {
    switch (prompt) {
        case basic_reasoning_prompt:  return basic_reasoning_content
        case scroll_reasoning_prompt: return scroll_reasoning_content
        default:                      return ''
    }
}
