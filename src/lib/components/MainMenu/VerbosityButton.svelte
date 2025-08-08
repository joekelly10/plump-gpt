<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { verbosity } from '$lib/stores/ai'

    const display_value = $derived($verbosity.charAt(0).toUpperCase() + $verbosity.slice(1))

    const clicked = (e) => {
        e.preventDefault()
        if (e.shiftKey) return verbosity.decrement()
        verbosity.increment()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        verbosity.decrement()
    }
</script>

<button
    class='main-menu-button verbosity-button'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='title'>
        Verbosity
    </div>
    <div class='value'>
        <div class='icon {$verbosity}'></div>
        <div class='display-value'>
            {display_value}
        </div>
    </div>
    
</button>

<style lang='sass'>
    .verbosity-button
        .value
            display:     flex
            align-items: center

        .icon
            margin-right:     12px
            width:            18px
            height:           18px
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey
            transition:       background-color easing.$quart-out 0.1s
            &.low
                mask-image: url('/img/icons/verbosity-low.png')
            &.medium
                mask-image: url('/img/icons/verbosity-medium.png')
            &.high
                mask-image: url('/img/icons/verbosity-high.png')

        &:hover
            .icon
                background-color: $off-white
                transition:       none
</style>


