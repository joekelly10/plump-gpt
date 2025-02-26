<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
    import { getPrices } from '$lib/utils/prices'

    let hovering = false

    $: prices            = getPrices($model.id)
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

    const clicked = () => model.next()

    const rightClicked = (e) => {
        e.preventDefault()
        model.prev()
        return false
    }
</script>

<svelte:document on:keydown={keydown} />

<button 
    class='model-switcher'
    title='Switch model (⌘+M)'
    on:click={clicked}
    on:contextmenu={rightClicked}
    on:mouseenter={() => hovering = true}
    on:mouseleave={() => hovering = false}
>
    <img class='icon' src='img/icons/models/{$model.icon}' alt='{$model.name}'>
    {$model.name}
    {#if hovering}
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
        display:     flex
        flex-wrap:   nowrap
        align-items: center
        height:      space.$header-height
        padding:     0 space.$default-padding
        font-size:   14px
        font-weight: 600
        cursor:      pointer

        &:hover
            background-color: $background-darkest
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)

    .icon
        margin-right: 16px
        height:       21px
    
    .prices
        display:        flex
        flex-direction: column
        margin-left:    16px
        font-size:      10px
        font-weight:    500
        color:          $blue-grey
        text-align:     left
        line-height:    12px
</style>
