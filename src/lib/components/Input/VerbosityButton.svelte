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
    class='verbosity-button'
    title='Adjust verbosity'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='icon {$verbosity}'></div>
    <div class='label'>
        <div class='title'>
            Verbosity
        </div>
        <div class='value'>
            {display_value}
        </div>
    </div>
    
</button>

<style lang='sass'>
    .verbosity-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$input-initial-height
        padding:         0 20px
        border-radius:   8px
        font-size:       12px
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            $size:            16px
            margin-right:     16px
            margin-left:      -3px
            width:            $size
            height:           $size
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $background-200
            transition:       background-color easing.$quart-out 0.1s
            &.low
                mask-image: url('/img/icons/verbosity-low.png')
            &.medium
                mask-image: url('/img/icons/verbosity-medium.png')
            &.high
                mask-image: url('/img/icons/verbosity-high.png')

        .label
            text-align:  left
            line-height: space.$temperature-control-line-height
            white-space: nowrap

            .title
                font-weight:    600
                text-transform: uppercase
            
            .value
                font-weight: 450
        
        &:hover
            background-color: $background-800
            color:            $off-white
            transition:       none

            .icon
                background-color: $off-white
                transition:       none
        
        &:active
            background-color: $background-850
            transition:       none
    
    @media (min-width: 1540px)
        .verbosity-button
            padding: 0 28px
</style>


