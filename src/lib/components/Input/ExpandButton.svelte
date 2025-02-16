<script>
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    export let input_overflowed = false,
               input_expanded = false

    $: show = input_overflowed || input_expanded

    const toggleExpanded = () => input_expanded = !input_expanded
</script>

{#if show}
    <button
        class='expand-button'
        class:expanded={input_expanded}
        on:click={toggleExpanded}
        in:slide={{ axis: 'y', delay: 333, duration: 125, easing: quartOut }}
        out:slide={{ axis: 'y', delay: 333, duration: 125, easing: quartOut }}
    >
        <span class='up-arrow'>
            ↑
        </span>
        <span class='down-arrow'>
            ↓
        </span>
    </button>
{/if}

<style lang='sass'>
    .expand-button
        display:          flex
        align-items:      center
        justify-content:  center
        position:         absolute
        top:              space.$default-padding + 12px
        left:             50%
        z-index:          1
        transform:        translateX(-50%) translateY(-100%)
        width:            700px
        height:           56px
        padding-bottom:   12px
        border-radius:    8px 8px 0 0
        background-color: $background-darkest
        background-color: color.adjust($background-darker, $lightness: -1.75%)
        color:            $off-white
        font-size:        19px
        cursor:           pointer

        &:hover
            background-color: $background-darkest

            .up-arrow
                color: $off-white

        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)

        .up-arrow
            display: block
            color:   $blue-grey

        .down-arrow
            display: none

        &.expanded
            .up-arrow
                display: none

            .down-arrow
                display: block
</style>
