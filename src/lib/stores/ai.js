import { writable } from 'svelte/store'
import { browser } from '$app/environment'

import defaults from '$lib/fixtures/defaults'
import models from '$lib/fixtures/models'

export const model           = createModel()
export const temperature     = createTemperature()
export const top_p           = createTopP()
export const active_tools    = createActiveTools()
export const thinking_budget = createThinkingBudget()
export const web_search      = createWebSearch()

model.subscribe(new_model => {
    active_tools.update(value => value.filter(tool => new_model.tools.includes(tool)))
})

function createModel() {
    const default_index = models.findIndex(m => m.id === defaults.model)

    const { subscribe, set, update } = writable(models[default_index])

    return {
        subscribe,
        set,
        next: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === models.length - 1) ? models[0] : models[i + 1]
            })
        },
        prev: () => {
            update(value => {
                let i = models.findIndex(m => m.id === value.id)
                return (i === 0) ? models[models.length - 1] : models[i - 1]
            })
        },
        setById: (id) => {
            const model = models.find(m => m.id === id)
            if (model) set(model)
        }
    }
}

function createTemperature() {
    const { subscribe, set, update } = writable(defaults.temperature)

    return {
        subscribe,
        set,
        increment: () => {
            update(value => {
                if (value === 1.2) return 0
                return (value * 10 + 1) / 10
            })
        },
        decrement: () => {
            update(value => {
                if (value === 0) return 1.2
                return (value * 10 - 1) / 10
            })
        }
    }
}

function createTopP() {
    const { subscribe, set, update } = writable(defaults.top_p)

    return {
        subscribe,
        set,
        increment: () => {
            update(value => {
                if (value === 1) return 0.05
                return (value * 10 + 0.5) / 10
            })
        },
        decrement: () => {
            update(value => {
                if (value === 0.05) return 1
                return (value * 10 - 0.5) / 10
            })
        }
    }
}

function createActiveTools() {
    const { subscribe, set, update } = writable([])

    return {
        subscribe,
        set,
        update,
        add: (tool_name) => {
            update(value => {
                if (!value.includes(tool_name)) {
                    value.push(tool_name)
                }
                return value
            })
        },
        remove: (tool_name) => {
            update(value => {
                value = value.filter(tool => tool !== tool_name)
                return value
            })
        }
    }
}

function createThinkingBudget() {
    const { subscribe, set, update } = writable(defaults.thinking_budget)

    return {
        subscribe,
        set,
        increment: () => {
            update(value => {
                if (value === 32000) return 0
                if (value < 4000) return value + 1000
                if (value < 12000) return value + 2000
                return value + 4000
            })
        },
        decrement: () => {
            update(value => {
                if (value === 0) return 32000
                if (value <= 4000) return value - 1000
                if (value <= 12000) return value - 2000
                return value - 4000
            })
        }
    }
}

function createWebSearch() {
    const { subscribe, set, update } = writable({
        open_ai: {
            search_context_size: 'medium'
        },
        anthropic: {
            max_uses:        5,
            allowed_domains: [],
            blocked_domains: []
        }
    })

    return {
        subscribe,
        set,
        increment_search_context_size: () => {
            update(value => {
                if (value.open_ai.search_context_size === 'high') return value
                let new_size
                switch (value.open_ai.search_context_size) {
                    case 'off':    new_size = 'low';    break
                    case 'low':    new_size = 'medium'; break
                    case 'medium': new_size = 'high';   break
                }
                return {
                    ...value,
                    open_ai: {
                        ...value.open_ai,
                        search_context_size: new_size
                    }
                }
            })
        },
        decrement_search_context_size: () => {
            update(value => {
                if (value.open_ai.search_context_size === 'off') return value
                let new_size
                switch (value.open_ai.search_context_size) {
                    case 'high':   new_size = 'medium'; break
                    case 'medium': new_size = 'low';    break
                    case 'low':    new_size = 'off';    break
                }
                return {
                    ...value,
                    open_ai: {
                        ...value.open_ai,
                        search_context_size: new_size
                    }
                }
            })
        },
        increment_max_uses: () => {
            update(value => { 
                if (value.anthropic.max_uses === 10) return value
                return {
                    ...value,
                    anthropic: {
                        ...value.anthropic,
                        max_uses: value.anthropic.max_uses + 1
                    }
                }
            })
        },
        decrement_max_uses: () => {
            update(value => {
                if (value.anthropic.max_uses === 0) return value
                return {
                    ...value,
                    anthropic: {
                        ...value.anthropic,
                        max_uses: value.anthropic.max_uses - 1
                    }
                }
            })
        }
    }
}

if (browser) {
    const stored_temperature     = localStorage.getItem('temperature'),
          stored_top_p           = localStorage.getItem('top_p'),
          stored_thinking_budget = localStorage.getItem('thinking_budget')

    if (stored_temperature) temperature.set(Number(stored_temperature))
    if (stored_top_p) top_p.set(Number(stored_top_p))
    if (stored_thinking_budget) thinking_budget.set(Number(stored_thinking_budget))

    temperature.subscribe(value => localStorage.setItem('temperature', value))
    top_p.subscribe(value => localStorage.setItem('top_p', value))
    thinking_budget.subscribe(value => localStorage.setItem('thinking_budget', value))
}
