<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
</script>

<div class='delete-hover-info' in:fly={{ x: 4, duration: 125, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
    <span class='text'>
        Delete
    </span>
</div>

<style lang='sass'>
    .delete-hover-info
        position:         absolute
        bottom:           space.$default-padding
        right:            space.$default-padding
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px
        border-radius:    8px
        background-color: $coral
        color:            $background-darkest

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600
</style>
