<script>
    import { onMount, createEventDispatcher, tick } from 'svelte'
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { page } from '$app/stores'
    import { initialising } from '$lib/stores/app'
    import { messages } from '$lib/stores/chat'
    import { model } from '$lib/stores/ai'

    const dispatch = createEventDispatcher()

    let fetched_prompt = false,
        got_model      = false,
        got_message    = false,
        sending        = false,
        fetch_error    = false,
        error_message  = ''

    onMount(async () => {
        const send_immediately = $page.url.searchParams.get('send_immediately')
        if (send_immediately) {
            await fetchAndSetDefaultPrompt()
        } else {
            await fetchAndSetActivePrompt()
        }

        if (!fetch_error) {
            fetched_prompt = true
            await tick()
            getModelFromURL()
            got_model = true
            getMessageFromURL()
            if (send_immediately) {
                dispatch('sendImmediately')
                removeSendImmediatelyFromURL()
                sending = true
            }
            await tick()
            dispatch('focusInput')
            $initialising = false
        }
    })

    const fetchAndSetActivePrompt = async () => {
        try {
            const response = await fetch('/api/system-prompts/active')
            if (!response.ok) throw new Error(`API returned ${response.status}`)
            const data = await response.json()
            $messages[0] = {
                ...$messages[0],
                system_prompt_id:    data.id,
                system_prompt_title: data.title,
                is_default:          data.default,
                content:             data.message
            }
        } catch (err) {
            error_message = 'Couldn’t connect to the database'
            fetch_error   = true
            console.error('Failed to fetch active system prompt:', err)
        }
    }

    const fetchAndSetDefaultPrompt = async () => {
        try {
            const response = await fetch('/api/system-prompts/default')
            if (!response.ok) throw new Error(`API returned ${response.status}`)
            const data = await response.json()
            $messages[0] = {
                ...$messages[0],
                system_prompt_id:    data.id,
                system_prompt_title: data.title,
                is_default:          data.default,
                content:             data.message
            }
        } catch (err) {
            error_message = 'Couldn’t connect to the database'
            fetch_error   = true
            console.error('Failed to fetch default system prompt:', err)
        }
    }

    const getModelFromURL = () => {
        if ($page.url.searchParams.has('model')) {
            model.setById($page.url.searchParams.get('model'))
            $page.url.searchParams.delete('model')
            window.history.replaceState(null, '', $page.url.toString())
        }
    }

    const getMessageFromURL = async () => {
        if ($messages.length === 1 && $page.url.searchParams.has('user_message')) {
            dispatch('setInputText', { text: $page.url.searchParams.get('user_message') })
            $page.url.searchParams.delete('user_message')
            window.history.replaceState(null, '', $page.url.toString())
            got_message = true
        }
    }

    const removeSendImmediatelyFromURL = () => {
        $page.url.searchParams.delete('send_immediately')
        window.history.replaceState(null, '', $page.url.toString())
    }
</script>

{#if $initialising}
    <div class='initialising' in:fade={{ duration: 100, easing: quartOut }} out:fade={{ delay: 333, duration: 250, easing: quartOut }}>
        <div class='inner'>
            {#if fetch_error}
                <div class='fetch-error' in:fade={{ delay: 500, duration: 75, easing: quartOut }}>
                    Initialisation error:
                    <div class='error-message'>
                        ⚠️ &nbsp; {error_message}
                    </div>
                </div>
            {:else}
                <div class='initialising-text'>
                    Initialising...
                </div>
                {#if fetched_prompt}
                    <div class='fetched-prompt' in:slide={{ axis: 'y', delay: 25, duration: 75, easing: quartOut }}>
                        System prompt ✓
                    </div>
                {/if}
                {#if got_model}
                    <div class='got-model' in:slide={{ axis: 'y', delay: 100, duration: 75, easing: quartOut }}>
                        Model ✓
                    </div>
                {/if}
                {#if got_message}
                    <div class='got-message' in:slide={{ axis: 'y', delay: 225, duration: 75, easing: quartOut }}>
                        Message ✓
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style lang='sass'>
    .initialising
        position:       absolute
        top:            50%
        left:           50%
        transform:      translate(-50%, -50%)
        padding-bottom: 76px
        font-weight:    450

    .inner
        min-width:     130px
        border-radius: 6px
        font-size:     14px
        line-height:   font.$line-height-14px
        color:         $background-lightest
        white-space:   nowrap

    .fetch-error
        color:       $off-white
        font-weight: 500

        .error-message
            color: $coral
</style>
