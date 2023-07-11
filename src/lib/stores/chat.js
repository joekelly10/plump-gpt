import { writable } from 'svelte/store'
import { system_message } from '$lib/prompts/basic_chat'

export const model         = createModel()
export const temperature   = writable(0.9)
export const top_p         = writable(1)
export const api_status    = writable('idle')
export const chat_id       = writable(null)
export const messages      = writable([system_message()])
export const loader_active = writable(false)
export const loader_page   = writable(1)

function createModel() {
    const models = [
        {
            name:         'gpt-3.5-turbo-0613',
            display_name: 'GPT 3.5 Turbo',
            icon:         'gpt-3.5.png'
        },
        {
            name:         'gpt-4',
            display_name: 'GPT 4',
            icon:         'gpt-4.png'
        }
    ]

    const { subscribe, set, update } = writable(models[0])

    return {
        subscribe,
        set,
        next: () => {
            update(value => {
                if (value.name === models[0].name) return models[1]
                if (value.name === models[1].name) return models[0]
            })
        }
    }
}
