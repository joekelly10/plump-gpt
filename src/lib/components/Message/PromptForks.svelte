<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_hovering } from '$lib/stores/chat/interactions'
    import { is_idle } from '$lib/stores/api'

    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    let {
        // actions
        switchToFork,

        // passive
        message
    } = $props()

    let show_hover_info_above = $state(false)

    const add_reply_highlight   = $derived($is_hovering.add_reply.includes(message.id)),
          delete_fork_highlight = $derived(message.forks.length > 1 && $is_hovering.delete.includes(message.id))

    const mouseenter = (e) => {
        const rect = e.target.getBoundingClientRect()
        show_hover_info_above = rect.bottom > window.innerHeight - 320
    }

    const getPreview = (next_message) => {
        if (!next_message) return ''
        return next_message.content.slice(0, 160) + (next_message.content.length > 160 ? ' [...]' : '')
    }

    const clickedFork = (fork) => {
        if ($is_idle) switchToFork(fork.index)
    }
</script>

<div class='prompt-forks-container' class:delete-fork-highlight={delete_fork_highlight} in:slide={{ delay: 125, duration: 250, easing: quartOut }} out:slide={{ duration: 250, easing: quartOut }}>
    <div class='inner'>
        {#each message.forks as fork, i}
            <button
                class='prompt-fork-button'
                class:active={fork.is_active}
                onclick={() => clickedFork(fork)}
                onmouseenter={mouseenter}
            >
                <ForkIcon className='icon' />
                {i + 1}
                <div class='hover-info' class:above={show_hover_info_above}>
                    <div class='avatar-container'>
                        {#if fork.model_icon}
                            <img class='model-icon' src='/img/icons/models/{fork.model_icon}' alt='AI model'/>
                        {/if}
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
            background-color: color.mix($coral, $background-300, 10%)
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
                border-top:       1px solid $background-500
                border-bottom:    1px solid $background-500
                background-color: $background-500
                font-size:        14px
                font-weight:      450
                color:            $background-200
                cursor:           pointer
                transition:       border-radius easing.$quart-out 0.125s

                &:nth-child(5n+1)
                    border-top-left-radius:    8px
                    border-bottom-left-radius: 8px
                    border-left:               1px solid $background-500
                
                &:nth-child(5n),
                &:last-child
                    border-top-right-radius:    8px
                    border-bottom-right-radius: 8px
                    border-right:               1px solid $background-500

                .icon
                    margin-right: 11px
                    margin-left:  -1px
                    height:       15px
                    fill:         $background-200

                .hover-info
                    +shared.fork-hover-info
                    
                    .avatar-container
                        justify-content: flex-start
                        margin:          -3px -6px

                &:hover
                    background-color: $background-700
                    color:            $off-white

                    .icon
                        fill: $off-white

                    &:not(.active)
                        .hover-info
                            opacity:    1
                            transition: opacity easing.$quart-out 125ms 500ms

                &:active
                    background-color: color.adjust($background-700, $lightness: -1%)

                &.active
                    font-weight:      450
                    color:            $background-800
                    border-color:     $blue
                    background-color: $blue

                    .icon
                        fill: $background-800
                
                &.temporary
                    border-left:      1px solid $background-700
                    background-color: $background-500
                    color:            white

                    .icon
                        fill: white
                    
                    .plus
                        margin-top:  -2px
                        font-size:   16px
                        line-height: 16px
</style>
