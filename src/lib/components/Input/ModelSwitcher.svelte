<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
    import { getPrices } from '$lib/utils/prices'

    const dispatch = createEventDispatcher()

    export let hovering = false

    let animate_model_change = false

    $: prices            = getPrices($model)
    $: input_price_text  = prices.input  === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`
    $: output_price_text = prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`
    $: modelChanged($model)

    const modelChanged = (_) => {
        animate_model_change = true
        setTimeout(() => { animate_model_change = false }, 5)
    }

    const keydown = (e) => {
        if (e.shiftKey && e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.prev()
            return
        }
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.next()
        }
    }

    const clicked = () => {
        dispatch('toggleModelList')
        dispatch('focusInput')
    }

    const rightClicked = (e) => {
        e.preventDefault()
        dispatch('focusInput')
        return false
    }

    const handleWheel = (e) => {
        e.preventDefault()
        if (e.deltaY > 0) {
            model.next()
        } else {
            model.prev()
        }
        return false
    }
</script>

<svelte:document on:keydown={keydown} />

<button 
    class='model-switcher'
    class:animate-model-change={animate_model_change}
    on:click={clicked}
    on:contextmenu={rightClicked}
    on:mouseenter={() => hovering = true}
    on:mouseleave={() => hovering = false}
    on:wheel={handleWheel}
>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='{$model.name}'>
    {#if hovering}
        <div class='name' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:slide={{ axis: 'x', duration: 125, easing: quartOut }}>
            {$model.name}
        </div>
        <div class='prices' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:slide={{ axis: 'x', duration: 125, easing: quartOut }}>
            <span class='input-price'>
                {input_price_text}
            </span>
            <span class='output-price'>
                {output_price_text}
            </span>
        </div>
    {/if}
</button>

<style lang='sass'>
    .model-switcher
        display:          flex
        flex-wrap:        nowrap
        align-items:      center
        position:         absolute
        top:              -1px
        right:            100%
        transform:        translateX(0 - space.$default-padding)
        height:           space.$input-initial-height
        padding:          0 16px
        border-radius:    8px
        background-color: transparent
        cursor:           pointer
        transition:       padding easing.$quart-out 0.25s, background-color easing.$quart-out 0.1s

        &:hover
            padding:          20px space.$default-padding
            background-color: $background-darkest
            transition:       padding easing.$quart-out 0.25s
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)

        &.animate-model-change
            .icon
                transform:  scale(1.2)
                transition: none

    .icon
        height:     24px
        transition: transform easing.$quart-out 0.125s
    
    .name
        padding-left: 18px
        font-size:    14px
        font-weight:  600
        white-space:  nowrap
    
    .prices
        display:        flex
        flex-direction: column
        padding-left:   18px
        font-family:    font.$mono
        font-size:      10.5px
        font-weight:    500
        color:          $blue-grey
        text-align:     right
        line-height:    16px
</style>
