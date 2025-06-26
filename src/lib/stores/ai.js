import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import defaults from '$lib/fixtures/defaults'
import models from '$lib/fixtures/models'

export const model       = createModel()
export const temperature = createTemperature()
export const top_p       = createTopP()

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

if (browser) {
    const stored_temperature = Number(localStorage.getItem('temperature'))
    const stored_top_p       = Number(localStorage.getItem('top_p'))

    if (stored_temperature) temperature.set(stored_temperature)
    if (stored_top_p) top_p.set(stored_top_p)

    temperature.subscribe(value => localStorage.setItem('temperature', value))
    top_p.subscribe(value => localStorage.setItem('top_p', value))
}
