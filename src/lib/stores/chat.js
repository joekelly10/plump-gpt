import { writable, derived } from 'svelte/store'
import { getCost } from '$lib/utils/prices'

export const initialising               = writable(true)
export const chat_id                    = writable(null)
export const messages                   = writable([{ id: 0, role: 'system', content: 'You are a helpful assistant.' }])  // replaced on launch
export const forks                      = writable([{ message_ids: [0], forked_at: [], provisional: false }])
export const active_fork                = writable(0)
export const stars                      = writable([])
export const shortcuts_active           = writable(false)
export const loader_active              = writable(false)
export const prompt_editor_active       = writable(false)
export const config                     = writable({ autosave: true })
export const deleting                   = writable(false)
export const adding_reply               = writable(false)
export const provisionally_forking      = writable(false)
export const below_autoscroll_threshold = writable(true)

export const active_messages = derived([messages, forks, active_fork], ([$messages, $forks, $active_fork]) => {
    return $messages.filter(m => $forks[$active_fork ?? 0]?.message_ids.includes(m.id))
})

export const fork_points = derived(forks, ($forks) => {
    if ($forks.length === 1) return []

    let message_id_pairs = []

    $forks.forEach(fork => {
        fork.forked_at.forEach(message_id => {
            const index = fork.message_ids.findIndex(id => id === message_id)
            const next  = fork.message_ids[index + 1]
            message_id_pairs.push([message_id, next])
        })
    })

    // Remove duplicates (keep only first occurrence of each)
    return message_id_pairs.filter((pair, index, self) => self.findIndex(p => p[0] === pair[0] && p[1] === pair[1]) === index)
})

export const usage = derived(messages, ($messages) => {
    const filtered       = $messages.filter(m => m.role === 'assistant')
    const total_messages = filtered.length

    let cache_write_tokens = 0,
        cache_read_tokens  = 0,
        input_tokens       = 0,
        output_tokens      = 0,
        total_cost         = 0,
        total_savings      = 0

    filtered.forEach(message => {
        const cost = getCost(message.model.id, message.usage)
        cache_write_tokens += message.usage.cache_write_tokens
        cache_read_tokens  += message.usage.cache_read_tokens
        input_tokens       += message.usage.input_tokens
        output_tokens      += message.usage.output_tokens
        total_cost         += cost.total
        total_savings      += cost.cache_savings
    })

    return { total_messages, cache_write_tokens, cache_read_tokens, input_tokens, output_tokens, total_cost, total_savings }
})
