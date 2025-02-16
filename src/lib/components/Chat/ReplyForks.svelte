<script>
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { api_status } from '$lib/stores/ai'
    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const dispatch = createEventDispatcher()

    export let message

    const clickedFork = (fork) => {
        if ($api_status === 'idle') dispatch('switchToFork', { fork_index: fork.index })
    }
</script>

<div class='reply-forks-container' in:fly={{ y: -20, delay: 0, duration: 250, easing: quartOut }}>
    {#each message.forks as fork, i}
        {#if fork.provisional}
            <button class='reply-fork-button provisional active'>
                <ForkIcon className='icon' />
                {i + 1}
            </button>
        {:else}
            <button class='reply-fork-button' class:active={fork.is_active} on:click={() => clickedFork(fork)}>
                <ForkIcon className='icon' />
                {i + 1}
            </button>
        {/if}
    {/each}
</div>

<style lang='sass'>
    .reply-forks-container
        display:         flex
        flex-wrap:       wrap
        row-gap:         16px
        justify-content: center
        margin:          0 auto
        width:           5 * space.$load-save-button-width
        margin-bottom:   space.$default-padding
        user-select:     none

        :global
            .reply-fork-button
                display:         flex
                justify-content: center
                align-items:     center
                width:           space.$load-save-button-width
                box-sizing:      border-box
                padding:         6px 0
                border-top:      1px solid $background-lighter
                border-bottom:   1px solid $background-lighter
                font-size:       14px
                font-weight:     450
                color:           $background-lightest
                cursor:          pointer

                &:nth-of-type(5n+1)
                    border-top-left-radius:    8px
                    border-bottom-left-radius: 8px
                    border-left:               1px solid $background-lighter
                
                &:nth-of-type(5n),
                &:last-of-type
                    border-top-right-radius:    8px
                    border-bottom-right-radius: 8px
                    border-right:               1px solid $background-lighter

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
                    border-color:     $blue
                    background-color: $blue
                    color:            $background-darker

                    .icon
                        fill: $background-darker
</style>
