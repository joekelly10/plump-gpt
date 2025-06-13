<script>
    import { fly, fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    export let is_starred = false,
               small      = false
</script>

<div class='hover-info-star' class:starred={is_starred} class:small={small} in:fly={{ x: -4, duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
    {#if !is_starred}
        <span class='text' in:slide={{ axis: 'x', delay: 25, duration: 75, easing: quartOut }} out:slide={{ axis: 'x', duration: 25, easing: quartOut }}>
            Add Star
        </span>
    {:else}
        <span class='text' in:slide={{ axis: 'x', delay: 25, duration: 75, easing: quartOut }} out:slide={{ axis: 'x', duration: 25, easing: quartOut }}>
            Remove Star
        </span>
    {/if}
</div>

<style lang='sass'>
    .hover-info-star
        position:         absolute
        bottom:           32px
        left:             32px
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          16px 24px
        border-radius:    8px
        background-color: $yellow
        color:            $background-800

        &.starred
            background-color: $background-500
            color:            $yellow

        &.small
            bottom:    50%
            left:      24px
            transform: translateY(50%)

    .text
        display:     inline-block
        line-height: 24px
        font-size:   16px
        font-weight: 600
        white-space: nowrap
</style>
