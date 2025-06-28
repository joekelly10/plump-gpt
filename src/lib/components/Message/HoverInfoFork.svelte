<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
</script>

<div class='hover-info-fork' in:fly={{ y: -1.5, duration: 100, easing: quartOut }} out:fly={{ y: -1.5, duration: 75, easing: quartOut }}>
    <span class='text'>
        Fork Here
    </span>
</div>

<style lang='sass'>
    .hover-info-fork
        position:         absolute
        bottom:           -1.5px
        right:            0
        transform:        translateY(100%)
        z-index:          1000
        display:          flex
        align-items:      center
        padding:          12px 24px 16px
        border-radius:    0 0 8px 8px
        background-color: $blue
        color:            $background-800

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600
</style>
