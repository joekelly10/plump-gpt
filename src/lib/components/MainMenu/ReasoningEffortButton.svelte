<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { reasoning_effort } from '$lib/stores/ai'

    const display_value = $derived($reasoning_effort.charAt(0).toUpperCase() + $reasoning_effort.slice(1))

    const clicked = (e) => {
        e.preventDefault()
        if (e.shiftKey) return reasoning_effort.decrement()
        reasoning_effort.increment()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        reasoning_effort.decrement()
    }
</script>

<button
    class='main-menu-button reasoning-effort-button'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='title'>
        Reasoning Effort
    </div>
    <div class='value'>
        <div class='icon {$reasoning_effort}'></div>
        <div class='display-value'>
            {display_value}
        </div>
    </div>
    
</button>

<style lang='sass'>
    .reasoning-effort-button
        .value
            display:     flex
            align-items: center

        .icon
            margin-right:     12px
            width:            18px
            height:           18px
            mask-image:       url('/img/icons/reasoning-effort-minimal.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey
            transition:       background-color easing.$quart-out 0.1s
            &.low
                mask-image: url('/img/icons/reasoning-effort-low.png')
            &.medium
                mask-image: url('/img/icons/reasoning-effort-medium.png')
            &.high
                mask-image: url('/img/icons/reasoning-effort-high.png')

        &:hover
            .icon
                background-color: $off-white
                transition:       none
</style>


