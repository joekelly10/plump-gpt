import { writable } from 'svelte/store'
import { browser } from '$app/environment'

import defaults from '$lib/fixtures/defaults'
import models from '$lib/fixtures/models'

export const model            = createModel()
export const temperature      = createTemperature()
export const top_p            = createTopP()
export const active_tools     = createActiveTools()
export const reasoning_effort = createReasoningEffort()
export const verbosity        = createVerbosity()
export const thinking_budget  = createThinkingBudget()
export const thinking_level   = createThinkingLevel()
export const web_search       = createWebSearch()
export const x_search         = createXSearch()
export const context_cache    = createContextCache()

model.subscribe(new_model => {
    active_tools.update(value => value.filter(tool => new_model.tools.includes(tool)))
})

function createModel() {
    const default_index = models.findIndex(m => m.id === defaults.model && m.family === defaults.model_family)

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
        },
        setByIdAndFamily: (id, family) => {
            const model = models.find(m => m.id === id && m.family === family)
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

function createReasoningEffort() {
    const { subscribe, set, update } = writable(defaults.reasoning_effort)

    return {
        subscribe,
        set,
        increment: () => {
            update(value => {
                if (value === 'high') return value
                if (value === 'medium') return 'high'
                if (value === 'low') return 'medium'
                if (value === 'minimal') return 'low'
                if (value === 'none') return 'minimal'
            })
        },
        decrement: () => {
            update(value => {
                if (value === 'none') return value
                if (value === 'minimal') return 'none'
                if (value === 'low') return 'minimal'
                if (value === 'medium') return 'low'
                if (value === 'high') return 'medium'
            })
        }
    }
}

function createVerbosity() {
    const { subscribe, set, update } = writable(defaults.verbosity)

    return {
        subscribe,
        set,
        increment: () => {
            update(value => {
                if (value === 'high') return value
                if (value === 'medium') return 'high'
                if (value === 'low') return 'medium'
            })
        },
        decrement: () => {
            update(value => {
                if (value === 'low') return value
                if (value === 'medium') return 'low'
                if (value === 'high') return 'medium'
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
                if (value === 32000) return value
                if (value < 4000) return value + 1000
                if (value < 12000) return value + 2000
                return value + 4000
            })
        },
        decrement: () => {
            update(value => {
                if (value === 0) return value
                if (value <= 4000) return value - 1000
                if (value <= 12000) return value - 2000
                return value - 4000
            })
        }
    }
}

function createThinkingLevel() {
    const { subscribe, set } = writable(defaults.thinking_level)

    //  increment and decrement functions for the thinking level
    //  are handled in the frontend component, because of complex
    //  custom rules (Pro has only low and high levels, Flash has
    //  minimal, low, medium, and high levels)

    return {
        subscribe,
        set
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

function createXSearch() {
    const { subscribe, set, update } = writable({
        post_view_count:     0,
        post_favorite_count: 0,
        included_x_handles:  [],
        excluded_x_handles:  []
    })

    return {
        subscribe,
        set,
        increment_post_view_count: () => {
            update(value => {
                if (value.post_view_count === 1000000) return value
                let new_count
                switch (value.post_view_count) {
                    case 0:      new_count = 10;      break
                    case 10:     new_count = 100;     break
                    case 100:    new_count = 1000;    break
                    case 1000:   new_count = 10000;   break
                    case 10000:  new_count = 20000;   break
                    case 20000:  new_count = 50000;   break
                    case 50000:  new_count = 100000;  break
                    case 100000: new_count = 200000;  break
                    case 200000: new_count = 500000;  break
                    case 500000: new_count = 1000000; break
                }
                return {
                    ...value,
                    post_view_count: new_count
                }
            })
        },
        decrement_post_view_count: () => {
            update(value => {
                if (value.post_view_count === 0) return value
                let new_count
                switch (value.post_view_count) {
                    case 1000000: new_count = 500000; break
                    case 500000:  new_count = 200000; break
                    case 200000:  new_count = 100000; break
                    case 100000:  new_count = 50000;  break
                    case 50000:   new_count = 20000;  break
                    case 20000:   new_count = 10000;  break
                    case 10000:   new_count = 5000;   break
                    case 5000:    new_count = 1000;   break
                    case 1000:    new_count = 100;    break
                    case 100:     new_count = 10;     break
                    case 10:      new_count = 0;      break
                }
                return {
                    ...value,
                    post_view_count: new_count
                }
            })
        },
        increment_post_favorite_count: () => {
            update(value => {
                if (value.post_favorite_count === 10000) return value
                let new_count
                switch (value.post_favorite_count) {
                    case 0:    new_count = 1;     break
                    case 1:    new_count = 2;     break
                    case 2:    new_count = 5;     break
                    case 5:    new_count = 10;    break
                    case 10:   new_count = 20;    break
                    case 20:   new_count = 50;    break
                    case 50:   new_count = 100;   break
                    case 100:  new_count = 200;   break
                    case 200:  new_count = 500;   break
                    case 500:  new_count = 1000;  break
                    case 1000: new_count = 10000; break
                }
                return {
                    ...value,
                    post_favorite_count: new_count
                }
            })
        },
        decrement_post_favorite_count: () => {
            update(value => {
                if (value.post_favorite_count === 0) return value
                let new_count
                switch (value.post_favorite_count) {
                    case 1:     new_count = 0;    break
                    case 2:     new_count = 1;    break
                    case 5:     new_count = 2;    break
                    case 10:    new_count = 5;    break
                    case 20:    new_count = 10;   break
                    case 50:    new_count = 20;   break
                    case 100:   new_count = 50;   break
                    case 200:   new_count = 100;  break
                    case 500:   new_count = 200;  break
                    case 1000:  new_count = 500;  break
                    case 10000: new_count = 1000; break
                }
                return {
                    ...value,
                    post_favorite_count: new_count
                }
            })
        }
    }
}

function createContextCache() {
    const { subscribe, set, update } = writable({ ttl_mins: 1 })

    return {
        subscribe,
        set,
        increment_ttl_mins: () => {
            update(value => {
                if (value.ttl_mins === 60) return value
                let new_ttl
                switch (value.ttl_mins) {
                    case 0:   new_ttl = 1;  break
                    case 1:   new_ttl = 2;  break
                    case 2:   new_ttl = 5;  break
                    case 5:   new_ttl = 10; break
                    case 10:  new_ttl = 15; break
                    case 15:  new_ttl = 30; break
                    case 30:  new_ttl = 60; break
                }
                return {
                    ...value,
                    ttl_mins: new_ttl
                }
            })
        },
        decrement_ttl_mins: () => {
            update(value => {
                if (value.ttl_mins === 0) return value
                let new_ttl
                switch (value.ttl_mins) {
                    case 1:  new_ttl = 0;  break
                    case 2:  new_ttl = 1;  break
                    case 5:  new_ttl = 2;  break
                    case 10: new_ttl = 5;  break
                    case 15: new_ttl = 10; break
                    case 30: new_ttl = 15; break
                    case 60: new_ttl = 30; break
                }
                return {
                    ...value,
                    ttl_mins: new_ttl
                }
            })
        }
    }
}

if (browser) {
    const stored_temperature      = localStorage.getItem('temperature'),
          stored_top_p            = localStorage.getItem('top_p'),
          stored_thinking_budget  = localStorage.getItem('thinking_budget'),
          stored_reasoning_effort = localStorage.getItem('reasoning_effort'),
          stored_verbosity        = localStorage.getItem('verbosity'),
          stored_thinking_level   = localStorage.getItem('thinking_level')

    if (stored_temperature)      temperature.set(Number(stored_temperature))
    if (stored_top_p)            top_p.set(Number(stored_top_p))
    if (stored_thinking_budget)  thinking_budget.set(Number(stored_thinking_budget))
    if (stored_reasoning_effort) reasoning_effort.set(stored_reasoning_effort)
    if (stored_verbosity)        verbosity.set(stored_verbosity)
    if (stored_thinking_level)   thinking_level.set(stored_thinking_level)

    temperature.subscribe(value => localStorage.setItem('temperature', value))
    top_p.subscribe(value => localStorage.setItem('top_p', value))
    thinking_budget.subscribe(value => localStorage.setItem('thinking_budget', value))
    reasoning_effort.subscribe(value => localStorage.setItem('reasoning_effort', value))
    verbosity.subscribe(value => localStorage.setItem('verbosity', value))
    thinking_level.subscribe(value => localStorage.setItem('thinking_level', value))
}
