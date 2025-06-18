<script>
    import { scale, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { config } from '$lib/stores/user'
    import { model as store_model } from '$lib/stores/ai'
    import { getPrices } from '$lib/utils/prices'
    import { cssSanitised } from '$lib/utils/helpers'

    import StarIcon from '$lib/components/Icons/Star.svelte'

    let {
        //actions
        focusInput,
        closeModelList,

        // bindable
        is_hovering_default = $bindable(false),
        is_hovering_prices  = $bindable(false),

        // passive
        model
    } = $props()

    let hold_timer

    let is_hovering_body = $state(false),
        hold_triggered   = $state(false)

    const prices            = $derived(getPrices(model)),
          input_price_text  = $derived(prices.input  === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`),
          output_price_text = $derived(prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`),
          is_active         = $derived(model.id === $store_model.id),
          is_default        = $derived(model.id === $config.default_model_id)

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
            focusInput()
            closeModelList()
        }
        hold_triggered = false
    }

    const onmouseenter        = () => is_hovering_body    = true,
          onmouseleave        = () => is_hovering_body    = false,
          onmouseenterDefault = () => is_hovering_default = true,
          onmouseleaveDefault = () => is_hovering_default = false,
          onmouseenterPrices  = () => is_hovering_prices  = true,
          onmouseleavePrices  = () => is_hovering_prices  = false
</script>

<button 
    id={`model-button-${cssSanitised(model.id)}`}
    class='model-button' 
    class:active={is_active} 
    onclick={clicked}
    onpointerdown={pointerDown}
    onpointerup={pointerUp}
    onpointerleave={pointerUp}
    onpointercancel={pointerUp}
    onmouseenter={onmouseenter}
    onmouseleave={onmouseleave}
>
    <img class='model-icon' src='/img/icons/models/{model.icon}' alt={model.name} />
    {#if is_default}
        <div
            class='default-icon-container'
            onmouseenter={onmouseenterDefault}
            onmouseleave={onmouseleaveDefault}
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
        onmouseenter={onmouseenterPrices}
        onmouseleave={onmouseleavePrices}
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
