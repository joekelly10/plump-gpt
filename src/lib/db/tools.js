export const formatForAPI = (db_chat) => {
    return {
        id:          db_chat.id,
        forks:       db_chat.forks,
        active_fork: db_chat.activeFork,
        stars:       db_chat.stars,
        highlights:  db_chat.highlights,
        updated_at:  db_chat.updatedAt,
        messages:    db_chat.messages.map(db_message => ({
            db_id:     db_message.id,
            id:        db_message.chronologicalId,
            parent_id: db_message.chronologicalParentId,
            role:      db_message.role,
            content:   db_message.content,
            timestamp: db_message.updatedAt,
            ...(db_message.role === 'system' && {
                system_prompt_id:    db_message.systemPromptId,
                system_prompt_title: db_message.systemPromptTitle,
                is_default:          db_message.systemPromptIsDefault
            }),
            ...(db_message.role === 'assistant' && {
                model:             db_message.model,
                temperature:       db_message.temperature,
                top_p:             db_message.topP,
                reasoning_effort:  db_message.reasoningEffort,
                verbosity:         db_message.verbosity,
                tools:             db_message.tools,
                reasoning_content: db_message.reasoningContent,
                signature:         db_message.signature,
                tool_uses:         db_message.toolUses,
                usage:             db_message.usage,
                raw:               db_message.raw
            })
        }))
    }
}
