<script>
    import { temperature } from '$lib/stores/ai'
    import TemperatureIcon from '$lib/components/Icons/Temperature.svelte'

    $: icon_level = $temperature > 1 ? 4 : Math.round($temperature / 0.25)

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

<button class='HEADER__temperature-button' title='Adjust temperature (ctrl+T)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <TemperatureIcon level={icon_level} className='icon' />
    {$temperature.toFixed(1)}
</button>

<style lang='sass'>
    :global
        .HEADER__temperature-button // safe global class name
            display:         flex
            flex-wrap:       nowrap
            justify-content: center
            align-items:     center
            height:          space.$header-height
            width:           space.$temperature-button-width
            font-size:       14px
            color:           $background-lightest
            cursor:          pointer

            &:hover
                background-color: $background-darkest
                font-weight:      600
                color:            white

                .icon
                    margin-left: -3px
                    fill:        white
            
            &:active
                background-color: color.adjust($background-darkest, $lightness: -1%)
                transition:       none

            .icon
                margin-right: 9px
                margin-left:  -4px
                height:       19.5px
                fill:         $background-lightest
</style>
