import { writable } from 'svelte/store'

export const initialising = writable(true)

export const tree_active          = writable(false)
export const loader_active        = writable(false)
export const prompt_editor_active = writable(false)
export const user_settings_active = writable(false)
export const model_list_active    = writable(false)
