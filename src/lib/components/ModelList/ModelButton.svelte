<script>
    import { createEventDispatcher } from 'svelte'
    import { scale, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { config } from '$lib/stores/user'
    import { model as store_model } from '$lib/stores/ai'
    import { getPrices } from '$lib/utils/prices'
    import { cssSanitised } from '$lib/utils/helpers'

    import StarIcon from '$lib/components/Icons/Star.svelte'

    const dispatch = createEventDispatcher()

    export let model,
               is_hovering_default,
               is_hovering_prices

    $: prices            = getPrices(model)
    $: input_price_text  = prices.input  === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`
    $: output_price_text = prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`
    $: is_default        = model.id === $config.default_model_id

    let hold_timer       = null,
        hold_triggered   = false,
        is_hovering_body = false

    const pointerDown = () => {
        hold_triggered = false
        clearTimeout(hold_timer)
        hold_timer = setTimeout(() => {
            hold_triggered = true
            $config.default_model_id = model.id
        }, 1000)
    }

    const pointerUp = () => {
        clearTimeout(hold_timer)
    }

    const clicked = () => {
        if (!hold_triggered) {
            store_model.setById(model.id)
            dispatch('focusInput')
            dispatch('closeModelList')
        }
        hold_triggered = false
    }

    const hovered          = () => is_hovering_body    = true,
          unhovered        = () => is_hovering_body    = false,
          hoveredDefault   = () => is_hovering_default = true,
          unhoveredDefault = () => is_hovering_default = false,
          hoveredPrices    = () => is_hovering_prices  = true,
          unhoveredPrices  = () => is_hovering_prices  = false
</script>

<button 
    id={`model-button-${cssSanitised(model.id)}`}
    class='model-button' 
    class:active={model.id === $store_model.id} 
    on:click={clicked}
    on:pointerdown={pointerDown}
    on:pointerup={pointerUp}
    on:pointerleave={pointerUp}
    on:pointercancel={pointerUp}
    on:mouseenter={hovered}
    on:mouseleave={unhovered}
>
    <img class='model-icon' src='/img/icons/models/{model.icon}' alt={model.name} />
    {#if is_default}
        <div
            class='default-icon-container'
            on:mouseenter={hoveredDefault}
            on:mouseleave={unhoveredDefault}
            in:scale={{ start: 0, duration: 200, easing: quartOut }}
        >
            <StarIcon className='default-icon' />
        </div>
    {/if}
    <div class='name-and-host'>
        <div class='name'>
            {model.name}
        </div>
        {#if is_hovering_body && !is_hovering_default && !is_hovering_prices}
            <div
                class='host'
                in:slide={{ axis: 'y', delay: 500, duration: 125, easing: quartOut }}
                out:slide={{ axis: 'y', duration: 75, easing: quartOut }}
            >
                {model.hosted_at}
            </div>
        {/if}
    </div>
    <div
        class='prices'
        on:mouseenter={hoveredPrices}
        on:mouseleave={unhoveredPrices}
    >
        <div class='input'>
            {input_price_text}
        </div>
        <div class='output'>
            {output_price_text}
        </div>
    </div>
</button>

<style lang='sass'>
    .model-button
        display:       flex
        align-items:   center
        gap:           16px
        position:      relative
        width:         100%
        min-height:    space.$input-initial-height
        box-sizing:    border-box
        padding:       space.$model-list-button-padding
        border-radius: 8px
        border:        1px solid transparent
        cursor:        pointer
        transition:    background-color easing.$quart-out 0.1s

        &:hover
            background-color: $background-700
            transition:       none
            
        &:active
            background-color: $background-800
            transform:        scale(0.99)
            transition:       none
            
        &.active
            border:           1px solid $blue
            background-color: $background-700

        .model-icon
            width: 24px

        .default-icon-container
            display:         flex
            justify-content: center
            align-items:     center
            position:        relative

            &:hover
                :global(.default-icon)
                    transform: scale(1.125)

            &:before
                content:   ''
                position:  absolute
                top:       50%
                left:      50%
                width:     48px
                height:    48px
                transform: translate(-50%, -50%)
        
            :global(.default-icon)
                height:   14px
                fill:     $yellow
                filter:   drop-shadow(0 0 1.5px $background-700)
        
        .name-and-host
            flex-grow:  1
            margin:     -8px 0
            text-align: left

            .name
                font-size:   14px
                font-weight: 600
                line-height: 21px

            .host
                font-size:   12px
                font-weight: 450
                line-height: 18px
                color:       $blue-grey
        
        .prices
            display:         flex
            flex-direction:  column
            justify-content: center
            align-items:     flex-end
            font-family:     font.$mono
            font-size:       10px
            font-weight:     500
            color:           $blue-grey
            line-height:     16px

            &:hover
                color: $off-white
</style>
