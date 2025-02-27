import { writable } from 'svelte/store'

export const highlights = writable({
    delete:     [],
    regenerate: [],
    add_reply:  [],
    star:       []
})

export const deleting              = writable(false)
export const adding_reply          = writable(false)
export const provisionally_forking = writable(false)
export const show_scroll_button    = writable(false)
