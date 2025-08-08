<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
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

<button
    class='main-menu-button temperature-button'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='title'>
        Temperature
    </div>
    <div class='value'>
        <TemperatureIcon level={icon_level} className='icon' />
        <div class='display-value'>
            {display_value}
        </div>
    </div>
</button>

<style lang='sass'>
    .temperature-button
        .value
            display:     flex
            align-items: center

        :global(.icon)
            margin-right: 9px
            margin-left:  -5px
            height:       18px
            fill:         $blue-grey
            transition:   fill easing.$quart-out 0.1s
        
        &:hover
            :global(.icon)
                fill:       $off-white
                transition: none
</style>
