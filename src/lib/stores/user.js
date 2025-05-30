import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const config = writable({
    default_model_id: 'gpt-4.1',
    autosave:         true,
    smooth_output:    true,
    change_favicon:   false
})

export const avatar_href = writable('/img/default_avatar.png')

if (browser) {
    const stored_avatar_href = localStorage.getItem('avatar_href')
    const stored_config = localStorage.getItem('config')

    if (stored_avatar_href) avatar_href.set(stored_avatar_href)

    if (stored_config) {
        try {
            const parsed_config = JSON.parse(stored_config)
            config.update(current => ({ ...current, ...parsed_config }))
        } catch (err) {
            console.error('Failed to parse stored config', err)
        }
    }

    avatar_href.subscribe(value => localStorage.setItem('avatar_href', value))
    config.subscribe(value => localStorage.setItem('config', JSON.stringify(value)))
}
