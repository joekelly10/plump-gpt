<script>
    import { temperature } from '$lib/stores/ai'

    import TemperatureIcon from '$lib/components/Icons/Temperature.svelte'

    const display_value = $derived($temperature.toFixed(1)),
          icon_level    = $derived($temperature > 1 ? 4 : Math.round($temperature / 0.3))
    
    const clicked = (e) => {
        e.preventDefault()
        if (e.shiftKey) return temperature.decrement()
        temperature.increment()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        temperature.decrement()
    }
</script>

<button class='temperature-button' title='Adjust temperature (Ctrl+T)' onclick={clicked} oncontextmenu={rightClicked}>
    <TemperatureIcon level={icon_level} className='icon' />
    <div class='label'>
        <div class='title'>
            Temp
        </div>
        <div class='value'>
            {display_value}
        </div>
    </div>
</button>

<style lang='sass'>
    .temperature-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$input-initial-height
        padding:         0 space.$default-padding
        border-radius:   8px
        font-size:       12px
        color:           $background-200
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s
        cursor:          pointer

        :global(.icon)
            margin-right: 9px
            margin-left:  -5px
            height:       18px
            fill:         $background-200
            transition:   fill easing.$quart-out 0.1s

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

            :global(.icon)
                fill:       $off-white
                transition: none

        &:active
            background-color: $background-850
            transition:       none
</style>
