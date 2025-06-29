import { writable } from 'svelte/store'

export const is_hovering              = createIsHovering()
export const is_deleting              = writable(false)
export const is_adding_reply          = writable(false)
export const is_provisionally_forking = writable(false)
export const is_scrolled_to_bottom    = writable(true)

const createIsHovering = () => {
    const { subscribe, set } = writable({
        delete:     [],
        regenerate: [],
        add_reply:  [],
        add_fork:   [],
        star:       []
    })

    return {
        subscribe,
        set,
        clear: () => {
            set({
                delete:     [],
                regenerate: [],
                add_reply:  [],
                add_fork:   [],
                star:       []
            })
        }
    }
}
