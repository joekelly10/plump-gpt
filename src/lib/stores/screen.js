import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export const screen_width  = writable(browser ? window.innerWidth : 0)
export const screen_height = writable(browser ? window.innerHeight : 0)

if (browser) {
    window.addEventListener('resize', () => {
        screen_width.set(window.innerWidth)
        screen_height.set(window.innerHeight)
    })
}
