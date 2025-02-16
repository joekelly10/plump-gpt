<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { api_status } from '$lib/stores/ai'
    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const dispatch = createEventDispatcher()

    export let message

    const clickedFork = (fork) => {
        if ($api_status === 'idle') dispatch('switchToFork', { fork_index: fork.index })
    }
</script>

<div class='prompt-forks-container' class:delete-fork-highlight={message.delete_fork_highlight} in:slide={{ delay: 125, duration: 250, easing: quartOut }} out:slide={{ duration: 250, easing: quartOut }}>
    <div class='inner'>
        {#each message.forks as fork, i}
            <button class='prompt-fork-button' class:active={fork.is_active} on:click={() => clickedFork(fork)}>
                <ForkIcon className='icon' />
                {i + 1}
            </button>
        {/each}
        {#if message.add_reply_highlight}
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

                &:hover
                    background-color: $background-darker
                    color:            $off-white

                    .icon
                        fill: $off-white

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
