<script>
    import { createEventDispatcher } from 'svelte'
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_idle } from '$lib/stores/api'
    import { avatar_href } from '$lib/stores/user'

    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const dispatch = createEventDispatcher()

    export let message

    let show_hover_info_above

    const mouseenter = (e) => {
        const rect = e.target.getBoundingClientRect()
        show_hover_info_above = rect.bottom > window.innerHeight - 320
    }

    const getPreview = (next_message) => {
        return next_message.content.slice(0, 160) + (next_message.content.length > 160 ? ' [...]' : '')
    }

    const clickedFork = (fork) => {
        if ($is_idle) dispatch('switchToFork', { fork_index: fork.index })
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
            <button
                class='reply-fork-button'
                class:active={fork.is_active}
                on:click={() => clickedFork(fork)}
                on:mouseenter={mouseenter}
            >
                <ForkIcon className='icon' />
                {i + 1}
                <div class='hover-info' class:above={show_hover_info_above}>
                    <div class='avatar-container'>
                        <img class='avatar' src={$avatar_href} alt='You'/>
                        <span class='down-arrow'>
                            ↓
                        </span>
                        {#if fork.model_icon}
                            <img class='model-icon' src='/img/icons/models/{fork.model_icon}' alt='AI model'/>
                        {/if}
                    </div>
                    <div class='next-message-preview'>
                        {getPreview(fork.next_message)}
                    </div>
                </div>
            </button>
        {/if}
    {/each}
    {#if message.forks.some(fork => fork.provisional)}
        <div class='provisional-fork-message' in:fade={{ delay: 250, duration: 75, easing: quartOut }}>
            Write another message to fork here...
        </div>
    {/if}
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
                position:        relative
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

                .hover-info
                    +shared.fork-hover-info

                &:hover
                    background-color: $background-darker
                    color:            $off-white

                    .icon
                        fill: $off-white

                    &:not(.active)
                        .hover-info
                            opacity:    1
                            transition: opacity easing.$quart-out 100ms 333ms
                
                &:active
                    background-color: color.adjust($background-darker, $lightness: -1%)

                &.active
                    border-color:     $blue
                    background-color: $blue
                    color:            $background-darker

                    .icon
                        fill: $background-darker

        .provisional-fork-message
            position:       relative
            width:          100%
            padding-top:    120px
            padding-bottom: 20px
            text-align:     center
            font-size:      14px
            font-weight:    450
            color:          $background-lightest
            line-height:    font.$line-height-14px
</style>
