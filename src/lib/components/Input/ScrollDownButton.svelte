<script>
    import { createEventDispatcher } from 'svelte'
    import { show_scroll_button } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    const dispatch = createEventDispatcher()

    const clicked = () => dispatch('clicked')
</script>

{#if $show_scroll_button}
    <button 
        class='scroll-down-button streaming'
        class:streaming={$api_status === 'streaming'}
        on:click={clicked}
        in:fly={{ y: 24, duration: 250, easing: quartOut }}
        out:fly={{ y: 12, duration: 125, easing: quartOut }}
    >
        ↓
    </button>
{/if}

<style lang='sass'>
    $button-size: 44px

    .scroll-down-button
        position:         absolute
        bottom:           100%
        right:            16px + space.$default-padding
        transform:        translateY(-48px)
        width:            $button-size
        height:           $button-size
        border-radius:    99px
        background-color: $background-lighter
        color:            $off-white
        font-size:        22px
        transition:       padding-top 150ms easing.$quart-out
        cursor:           pointer

        &:hover
            padding-top:      5px
            background-color: color.adjust($background-lighter, $lightness: 2%)
            transition:       none
        
        &:active
            background-color: color.adjust($background-lighter, $lightness: 1%)
        
        &.streaming
            &:after
                content:       ''
                position:      absolute
                top:           -0.5px
                left:          -0.5px
                width:         $button-size + 1px
                height:        $button-size + 1px
                box-sizing:    border-box
                border-radius: 99px
                border-bottom: 1px solid $off-white
                border-left:   2px solid transparent
                animation:     streaming 750ms linear infinite

    @keyframes streaming
        0%
            transform: rotate(0deg)
        100%
            transform: rotate(360deg)
</style>
