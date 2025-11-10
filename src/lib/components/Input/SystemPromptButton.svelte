<script>
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { prompt_editor_active } from '$lib/stores/app'
    import { messages } from '$lib/stores/chat'

    let two_secs_elapsed = $state(false)

    const highlight = $derived($messages[0].system_prompt_title && !$messages[0].is_default && !two_secs_elapsed),
          read_only = $derived($messages.length > 1)

    onMount(() => {
        setTimeout(() => two_secs_elapsed = true, 2000)
    })

    const openPromptEditor = () => {
        $prompt_editor_active = true
    }
</script>

<button
    class='system-prompt-button'
    class:is-read-only={read_only}
    class:editor-active={$prompt_editor_active}
    onclick={openPromptEditor}
    transition:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
>
    <div class='text'>
        <div class='label'>
            System Prompt
        </div>
        <div class='prompt-title' class:highlight={highlight}>
            {$messages[0].system_prompt_title ?? ''}
        </div>
    </div>
</button>

<style lang='sass'>
    .system-prompt-button
        display:       flex
        align-items:   center
        gap:           16px
        position:      absolute
        top:           space.$input-section-padding
        right:         16px
        max-width:     320px
        height:        space.$input-initial-height
        box-sizing:    border-box
        padding-left:  space.$default-padding
        padding-right: space.$default-padding
        border-radius: 8px
        line-height:   font.$line-height-14px
        font-size:     14px
        font-weight:   450
        color:         $background-200
        text-align:    right
        cursor:        pointer
        transition:    background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .label
            font-weight:    600
            font-size:      12px
            text-transform: uppercase
            white-space:    nowrap

        .prompt-title
            font-weight: 600
            color:       $off-white
            transition:  font-size easing.$quart-out 0.25s, color easing.$quart-out 0.1s
            white-space: nowrap

            &.highlight
                font-size: 1.25em
                color:     $yellow

        &:hover
            background-color: $background-800
            color:            $off-white
            transition:       none

            .prompt-title
                transition: font-size easing.$quart-out 0.25s
        
        &:active
            background-color: $background-850
            color:            $off-white
            transition:       none

            .prompt-title
                transition: none

        &.is-read-only
            .prompt-title
                color: $blue-grey

        &.editor-active
            border-color: $background-800
            color:        $off-white
</style>
