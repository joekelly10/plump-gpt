<script>
    import { onMount } from 'svelte'
    import { prompt_editor_active } from '$lib/stores/app'
    import { messages } from '$lib/stores/chat'

    import SystemPromptIcon from '$lib/components/Icons/SystemPrompt.svelte'

    let two_secs_elapsed = false

    $: highlight = $messages[0].system_prompt_title && !$messages[0].is_default && !two_secs_elapsed

    onMount(() => {
        setTimeout(() => two_secs_elapsed = true, 2000)
    })

    const openPromptEditor = () => {
        $prompt_editor_active = true
    }
</script>

<div class='system-prompt-button-container'>
    <button
        class='system-prompt-button'
        class:editor-active={$prompt_editor_active}
        on:click={openPromptEditor}
    >
        <SystemPromptIcon className='icon' />
        <div class='button-title'>
            Prompt<br>
            <span class='prompt-title' class:highlight={highlight}>
                {$messages[0].system_prompt_title ?? ''}
            </span>
        </div>
    </button>
</div>

<style lang='sass'>
    .system-prompt-button-container
        position: absolute
        top:      0
        right:    16px
        height:   100%

        :global
            .system-prompt-button
                display:       flex
                align-items:   center
                gap:           16px
                max-width:     320px
                height:        100%
                box-sizing:    border-box
                padding-left:  space.$default-padding
                padding-right: space.$default-padding
                line-height:   font.$line-height-14px
                font-size:     14px
                font-weight:   450
                color:         $background-lightest
                text-align:    left
                cursor:        pointer

                .icon
                    flex-shrink: 0
                    height:      21px
                    fill:        $background-lightest

                .prompt-title
                    font-weight: 600
                    color:       $off-white
                    transition:  font-size easing.$quart-out 0.25s

                    &.highlight
                        font-size: 1.25em
                        color:     $yellow

                &:hover
                    background-color: $background-darkest
                    color:            $blue-grey

                    .icon
                        fill: $blue-grey

                    .prompt-title
                        color: $off-white
                
                &:active
                    background-color: color.adjust($background-darkest, $lightness: -1%)
                    color:            $blue-grey

                    .icon
                        fill: $blue-grey

                    .prompt-title
                        color: $off-white

                &.editor-active
                    border-color: $background-lighter
                    color:        $blue-grey

                    .icon
                        fill: $blue-grey
                    
                    .prompt-title
                        color: $off-white
</style>
