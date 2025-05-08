<script>
    import { temperature } from '$lib/stores/ai'

    import TemperatureIcon from '$lib/components/Icons/Temperature.svelte'

    $: icon_level = $temperature > 1 ? 4 : Math.round($temperature / 0.3)

    const increment = () => {
        if ($temperature === 1.2) return $temperature = 0
        $temperature = ($temperature * 10 + 1) / 10
    }

    const decrement = () => {
        if ($temperature === 0) return $temperature = 1.2
        $temperature = ($temperature * 10 - 1) / 10
    }
    
    const clicked = (e) => {
        if (e.shiftKey) return decrement()
        increment()
    }

    const rightClicked = () => decrement()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 't') return increment()
        if (e.ctrlKey && e.shiftKey && e.key === 'T') return decrement()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='temperature-button' title='Adjust temperature (ctrl+T)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <TemperatureIcon level={icon_level} className='icon' />
    <div class='label'>
        <div class='title'>
            Temp
        </div>
        <div class='value'>
            {$temperature.toFixed(1)}
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
        color:           $background-lightest
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s
        cursor:          pointer

        :global(.icon)
            margin-right: 9px
            margin-left:  -5px
            height:       18px
            fill:         $background-lightest
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
            background-color: $background-darkest
            color:            $off-white
            transition:       none

            :global(.icon)
                fill:       $off-white
                transition: none

        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
            transition:       none
</style>
