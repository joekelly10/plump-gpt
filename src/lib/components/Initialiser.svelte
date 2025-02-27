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
        sending        = false

    onMount(async () => {
        const send_immediately = $page.url.searchParams.get('send_immediately')
        if (send_immediately) {
            await fetchAndSetDefaultPrompt()
        } else {
            await fetchAndSetActivePrompt()
        }
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
    })

    const fetchAndSetActivePrompt = async () => {
        const response = await fetch('/api/system-prompts/active')
        const data = await response.json()
        $messages[0] = {
            ...$messages[0],
            system_prompt_id:    data.id,
            system_prompt_title: data.title,
            is_default:          data.default,
            content:             data.message
        }
    }

    const fetchAndSetDefaultPrompt = async () => {
        const response = await fetch('/api/system-prompts/default')
        const data = await response.json()
        $messages[0] = {
            ...$messages[0],
            system_prompt_id:    data.id,
            system_prompt_title: data.title,
            is_default:          data.default,
            content:             data.message
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

    .inner
        width:         130px
        border-radius: 6px
        font-size:     14px
        line-height:   font.$line-height-14px
        color:         $background-lightest
        white-space:   nowrap
</style>
