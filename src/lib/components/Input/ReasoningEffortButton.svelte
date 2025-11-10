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
    class='reasoning-effort-button'
    title='Adjust reasoning effort'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='icon {$reasoning_effort}'></div>
    <div class='label'>
        <div class='title'>
            Effort
        </div>
        <div class='value'>
            {display_value}
        </div>
    </div>
    
</button>

<style lang='sass'>
    .reasoning-effort-button
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
            $size:            18px
            margin-right:     16px
            margin-left:      -6px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/reasoning-effort-minimal.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $background-200
            transition:       background-color easing.$quart-out 0.1s
            &.low
                mask-image: url('/img/icons/reasoning-effort-low.png')
            &.medium
                mask-image: url('/img/icons/reasoning-effort-medium.png')
            &.high
                mask-image: url('/img/icons/reasoning-effort-high.png')

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
        .reasoning-effort-button
            padding: 0 28px

    @media (min-width: 1600px)
        .reasoning-effort-button
            padding: 0 space.$default-padding
</style>


