<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
    import { getPrices } from '$lib/utils/prices'

    const dispatch = createEventDispatcher()

    export let hovering = false

    $: prices            = getPrices($model)
    $: input_price_text  = prices.input  === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`
    $: output_price_text = prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`

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
        model.next()
        dispatch('focusInput')
    }

    const rightClicked = (e) => {
        e.preventDefault()
        model.prev()
        dispatch('focusInput')
        return false
    }
</script>

<svelte:document on:keydown={keydown} />

<button 
    class='model-switcher'
    on:click={clicked}
    on:contextmenu={rightClicked}
    on:mouseenter={() => hovering = true}
    on:mouseleave={() => hovering = false}
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

    .icon
        height: 24px
    
    .name
        padding-left: 18px
        font-size:    14px
        font-weight:  600
        white-space:  nowrap
    
    .prices
        display:        flex
        flex-direction: column
        padding-left:   18px
        font-size:      10.5px
        font-weight:    500
        color:          $blue-grey
        text-align:     left
        line-height:    14px
</style>
