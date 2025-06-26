import { writable, derived } from 'svelte/store'
import { getCost } from '$lib/utils/prices'

export const chat_id     = writable(null)
export const messages    = writable([{ id: 0, role: 'system', content: 'You are a helpful assistant.' }])  // replaced on launch
export const forks       = writable([{ message_ids: [0], forked_at: [], provisional: false }])
export const active_fork = writable(0)
export const stars       = writable([])
export const highlights  = writable([])

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

export const active_messages = derived([messages, forks, active_fork, fork_points], ([$messages, $forks, $active_fork, $fork_points]) => {
    const active = $messages.filter(m => $forks[$active_fork ?? 0]?.message_ids.includes(m.id))

    function hasSiblings(message) {
        if (message.id === 0) return false
        const parent = $messages.find(m => m.id === message.parent_id)
        return getForksAt(parent).length > 0
    }

    function getForksAt(message) {
        let all_forks = []

        const firstIndexOf = (fork_point) => {
            const index = $forks.findIndex(fork => {
                const index = fork.message_ids.findIndex(id => id === fork_point[0])
                return fork.message_ids[index + 1] === fork_point[1]
            })
            return index
        }

        const fork_pts = $fork_points.filter(pair => pair[0] === message.id)

        fork_pts.forEach(fp => {
            const index           = firstIndexOf(fp),
                  active_ids      = $forks[$active_fork].message_ids,
                  message_index   = active_ids.indexOf(message.id),
                  is_active       = fp[1] === active_ids[message_index + 1],
                  provisional     = $forks[index]?.provisional,
                  message_ids     = $forks[index]?.message_ids ?? [],
                  next_message_id = message_ids[message_ids.findIndex(id => id === message.id) + 1] ?? null,
                  next_message    = $messages.find(m => m.id === next_message_id)

            let model_icon

            // optionals (?) are needed here for the in-between moment when
            // a provisional fork is created:

            if (message.role === 'user') {
                model_icon = next_message?.model?.icon
            } else {
                const next_ai_message_id = message_ids[message_ids.findIndex(id => id === message.id) + 2],
                      next_ai_message    = $messages.find(m => m.id === next_ai_message_id)
                model_icon = next_ai_message?.model?.icon
            }

            all_forks.push({
                index,
                is_active,
                provisional,
                next_message,
                model_icon
            })
        })

        return all_forks
    }

    const mapped = active.map((message, i) => ({
        ...message,
        is_last:      i === active.length - 1,
        has_siblings: hasSiblings(message),
        forks:        getForksAt(message)
    }))

    return mapped
})

export const usage = derived(messages, ($messages) => {
    const filtered        = $messages.filter(m => m.role === 'assistant')
    const total_responses = filtered.length

    let input_tokens       = 0,
        output_tokens      = 0,
        cache_write_tokens = 0,
        cache_read_tokens  = 0,
        total_cost         = 0,
        total_savings      = 0

    filtered.forEach(message => {
        const cost = getCost(message.model, message.usage)
        input_tokens       += message.usage.input_tokens
        output_tokens      += message.usage.output_tokens
        cache_write_tokens += message.usage.cache_write_tokens
        cache_read_tokens  += message.usage.cache_read_tokens
        total_cost         += cost.total
        total_savings      += cost.cache_savings
    })

    return { total_responses, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, total_cost, total_savings }
})
