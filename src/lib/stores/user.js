import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import defaults from '$lib/fixtures/defaults'

export const config = writable({
    default_model_id: defaults.model,
    autosave:         defaults.autosave,
    smooth_output:    defaults.smooth_output,
    change_favicon:   defaults.change_favicon
})

export const avatar_href = writable('/img/default_avatar.png')

export const location = writable({
    type:     'approximate',
    city:     'London',
    region:   'England',
    country:  'UK',
    timezone: 'Europe/London'
})

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
