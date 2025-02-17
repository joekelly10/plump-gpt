<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { highlights } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const dispatch = createEventDispatcher()

    export let message

    let show_hover_info_above

    $: add_reply_highlight   = $highlights.add_reply.includes(message.id)
    $: delete_fork_highlight = message.forks.length > 1 && $highlights.delete.includes(message.id)

    const getPreview = (next_message) => {
        if (!next_message) return ''
        return next_message.content.slice(0, 160) + (next_message.content.length > 160 ? ' [...]' : '')
    }

    const clickedFork = (fork) => {
        if ($api_status === 'idle') dispatch('switchToFork', { fork_index: fork.index })
    }

    const mouseenter = (e) => {
        const rect = e.target.getBoundingClientRect()
        show_hover_info_above = rect.bottom > window.innerHeight - 320
    }
</script>

<div class='prompt-forks-container' class:delete-fork-highlight={delete_fork_highlight} in:slide={{ delay: 125, duration: 250, easing: quartOut }} out:slide={{ duration: 250, easing: quartOut }}>
    <div class='inner'>
        {#each message.forks as fork, i}
            <button
                class='prompt-fork-button'
                class:active={fork.is_active}
                on:click={() => clickedFork(fork)}
                on:mouseenter={mouseenter}
            >
                <ForkIcon className='icon' />
                {i + 1}
                <div class='hover-info' class:above={show_hover_info_above}>
                    <div class='avatar-container'>
                        <img class='model-icon' src='/img/icons/models/{fork.model_icon}' alt='AI model'/>
                    </div>
                    <div class='next-message-preview'>
                        {getPreview(fork.next_message)}
                    </div>
                </div>
            </button>
        {/each}
        {#if add_reply_highlight}
            <button class='prompt-fork-button temporary' in:slide={{ axis: 'x', duration: 125, easing: quartOut }} out:slide={{ axis: 'x', duration: 125, easing: quartOut }}>
                <ForkIcon className='icon' />
                <span class='plus'>+</span>
            </button>
        {/if}
    </div>
</div>

<style lang='sass'>
    .prompt-forks-container
        display:          flex
        justify-content:  center
        padding:          24px 0
        background-color: $prompt-forks-bg
        user-select:      none
        transition:       background-color easing.$quart-out 0.125s

        &.delete-fork-highlight
            background-color: color.mix($coral, $background-lighter, 10%)
            transition:       none

            .prompt-fork-button
                &.active
                    background-color: $coral
                    border-color:     $coral

        .inner
            display:         flex
            flex-wrap:       wrap
            row-gap:         16px
            justify-content: center
            width:           5 * space.$load-save-button-width

        :global
            .prompt-fork-button
                display:          flex
                justify-content:  center
                align-items:      center
                position:         relative
                width:            space.$load-save-button-width
                box-sizing:       border-box
                padding:          6px 0
                border-top:       1px solid $background
                border-bottom:    1px solid $background
                background-color: $background
                font-size:        14px
                font-weight:      450
                color:            $background-lightest
                cursor:           pointer
                transition:       border-radius easing.$quart-out 0.125s

                &:nth-child(5n+1)
                    border-top-left-radius:    8px
                    border-bottom-left-radius: 8px
                    border-left:               1px solid $background
                
                &:nth-child(5n),
                &:last-child
                    border-top-right-radius:    8px
                    border-bottom-right-radius: 8px
                    border-right:               1px solid $background

                .icon
                    margin-right: 11px
                    margin-left:  -1px
                    height:       15px
                    fill:         $background-lightest

                .hover-info
                    +shared.fork-hover-info
                    
                    .avatar-container
                        justify-content: flex-start
                        margin:          -3px -6px

                &:hover
                    background-color: $background-darker
                    color:            $off-white

                    .icon
                        fill: $off-white

                    &:not(.active)
                        .hover-info
                            opacity:    1
                            transition: opacity easing.$quart-out 100ms 100ms

                &:active
                    background-color: color.adjust($background-darker, $lightness: -1%)

                &.active
                    font-weight:      450
                    color:            $background-darkest
                    border-color:     $blue
                    background-color: $blue

                    .icon
                        fill: $background-darkest
                
                &.temporary
                    border-left:      1px solid $background-darker
                    background-color: $background
                    color:            white

                    .icon
                        fill: white
                    
                    .plus
                        margin-top:  -2px
                        font-size:   16px
                        line-height: 16px
</style>
