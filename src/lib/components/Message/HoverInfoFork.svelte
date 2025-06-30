<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
</script>

<div class='hover-info-fork-clipper'>
    <div class='hover-info-fork' in:fly={{ y: -4, duration: 100, easing: quartOut }} out:fly={{ y: -4, duration: 75, easing: quartOut }}>
        <span class='text'>
            Fork Here
        </span>
    </div>
</div>

<style lang='sass'>
    .hover-info-fork-clipper
        position: absolute
        top:      100%
        left:     0
        width:    100%
        height:   200px // any size, just bigger than it needs to be   
        overflow: hidden

    .hover-info-fork
        position:         absolute
        top:              0
        right:            0
        display:          flex
        align-items:      center
        padding:          14.5px 24px 16px
        border-radius:    0 0 8px 8px
        background-color: $blue
        color:            $background-800

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600
</style>
