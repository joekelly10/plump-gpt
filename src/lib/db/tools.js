export const formatForAPI = (db_chat) => {
    return {
        id:          db_chat.id,
        forks:       db_chat.forks,
        active_fork: db_chat.activeFork,
        stars:       db_chat.stars,
        highlights:  db_chat.highlights,
        updated_at:  db_chat.updatedAt,
        messages:    db_chat.messages.map(message => ({
            db_id:     message.id,
            id:        message.chronologicalId,
            parent_id: message.chronologicalParentId,
            role:      message.role,
            content:   message.content,
            timestamp: message.updatedAt,
            ...(message.role === 'system' && {
                system_prompt_id:    message.systemPromptId,
                system_prompt_title: message.systemPromptTitle,
                is_default:          message.systemPromptIsDefault
            }),
            ...(message.role === 'assistant' && {
                model:             message.model,
                temperature:       message.temperature,
                top_p:             message.topP,
                usage:             message.usage,
                reasoning_content: message.reasoningContent
            })
        }))
    }
}
