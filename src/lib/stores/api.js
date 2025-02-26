import { writable, derived } from 'svelte/store'

export const api_state = createApiStateMachine()

export const is_idle      = derived(api_state, $state => $state.status === 'idle')
export const is_sending   = derived(api_state, $state => $state.status === 'sending')
export const is_streaming = derived(api_state, $state => $state.status === 'streaming')
export const error        = derived(api_state, $state => $state.error)

function createApiStateMachine() {
    const { subscribe, set, update } = writable({
        status:             'idle',
        error:              null,
        sent_at:            null,
        stream_started_at:  null,
        stream_finished_at: null,
        errored_at:         null
    })

    return {
        subscribe,

        startSending: () => {
            let success = false
            update(state => {
                if (state.status !== 'idle') {
                    console.warn('API state: Can’t start sending when not idle...')
                    return state
                }
                success = true
                return {
                    ...state,
                    status:  'sending',
                    sent_at: Date.now(),
                    error:   null
                }
            })
            return success
        },

        startStreaming: () => {
            let success = false
            update(state => {
                if (state.status !== 'sending') {
                    console.warn('API state: Can’t start streaming when not sending.')
                    return state
                }
                success = true
                return {
                    ...state,
                    status:            'streaming',
                    stream_started_at: Date.now()
                }
            })
            return success
        },

        finishStreaming: () => {
            let success         = false,
                stream_duration = 0
            update(state => {
                if (state.status !== 'streaming') {
                    console.warn('API state: Can’t finish streaming when not streaming.')
                    return state
                }
                success         = true
                stream_duration = ((Date.now() - state.stream_started_at) / 1000).toFixed(2)
                return {
                    ...state,
                    status: 'idle',
                    stream_finished_at: Date.now()
                }
            })
            console.log(`🤖–🏁 Finished streaming in ${stream_duration}s`)
            return success
        },

        setError: (message) => {
            update(state => ({
                ...state,
                status:     'idle',
                error:      message,
                errored_at: Date.now()
            }))
        },

        reset: () => {
            set({
                status:             'idle',
                error:              null,
                sent_at:            null,
                stream_started_at:  null,
                stream_finished_at: null,
                errored_at:         null
            })
        }
    }
}
