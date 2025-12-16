<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_scrolled_to_bottom } from '$lib/stores/chat/interactions'
    import { is_streaming } from '$lib/stores/api'

    let { scrollChatToBottom } = $props()

    const clicked = () => {
        scrollChatToBottom({ context: 'scroll_down_button' })
    }
</script>

{#if !$is_scrolled_to_bottom}
    <button 
        class='scroll-down-button streaming'
        class:streaming={$is_streaming}
        onclick={clicked}
        in:fade={{ duration: 250, easing: quartOut }}
        out:fade={{ duration: 125, easing: quartOut }}
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
        z-index:          1
        transform:        translateY(-48px)
        width:            $button-size
        height:           $button-size
        border-radius:    99px
        background-color: $background-300
        color:            $off-white
        font-size:        22px
        transition:       padding-top 150ms easing.$quart-out
        cursor:           pointer

        &:hover
            padding-top:      5px
            background-color: color.adjust($background-300, $lightness: 2%)
            transition:       none
        
        &:active
            background-color: color.adjust($background-300, $lightness: 1%)
        
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
                border-bottom: 2px solid $off-white
                border-left:   4px solid transparent
                animation:     streaming 750ms linear infinite

    @keyframes streaming
        0%
            transform: rotate(0deg)
        100%
            transform: rotate(360deg)
</style>
