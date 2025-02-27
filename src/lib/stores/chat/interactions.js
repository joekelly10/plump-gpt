import { writable } from 'svelte/store'

export const highlights = writable({
    delete:     [],
    regenerate: [],
    add_reply:  [],
    star:       []
})

export const is_deleting              = writable(false)
export const is_adding_reply          = writable(false)
export const is_provisionally_forking = writable(false)
export const is_scrolled_to_bottom    = writable(true)
