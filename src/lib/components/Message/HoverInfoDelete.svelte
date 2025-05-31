<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    export let small = false
</script>

<div class='hover-info-delete' class:small={small} in:fly={{ x: 4, duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
    <span class='text'>
        Delete
    </span>
</div>

<style lang='sass'>
    .hover-info-delete
        position:         absolute
        bottom:           32px
        right:            32px
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          16px 24px
        border-radius:    8px
        background-color: $coral
        color:            $background-darkest

        &.small
            bottom:    50%
            right:     24px
            transform: translateY(50%)

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600
</style>
