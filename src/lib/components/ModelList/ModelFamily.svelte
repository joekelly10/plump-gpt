<script>
    import { createEventDispatcher } from 'svelte'
    import { getPrices } from '$lib/utils/prices'
    import { model as store_model } from '$lib/stores/ai'

    const dispatch = createEventDispatcher()

    export let family, models

    const inputPriceText = (model) => {
        const prices = getPrices(model)
        return prices.input === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`
    }

    const outputPriceText = (model) => {
        const prices = getPrices(model)
        return prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`
    }

    const clicked = (model) => {
        store_model.setById(model.id)
        dispatch('focusInput')
        dispatch('closeModelList')
    }
</script>

<div class='model-family'>
    <div class='heading'>
        {family}
    </div>
    <div class='models'>
        {#each models as model}
            <button class='model-button' class:active={model.id === $store_model.id} on:click={() => clicked(model)}>
                <img class='icon' src='img/icons/models/{model.icon}' alt={model.name} />
                <div class='name'>
                    {model.name}
                </div>
                <div class='prices'>
                    <div class='input'>
                        {inputPriceText(model)}
                    </div>
                    <div class='output'>
                        {outputPriceText(model)}
                    </div>
                </div>
            </button>
        {/each}
    </div>
</div>

<style lang='sass'>
    $model-padding: 16px

    .model-family
        display:        flex
        align-items:    flex-start
        flex-direction: column
        gap:            12px
        width:          space.$model-family-width
        padding-bottom: space.$default-padding

    .heading
        padding-left:   $model-padding
        font-size:      12px
        font-weight:    600
        text-transform: uppercase
        color:          $blue-grey
    
    .models
        display:        flex
        flex-direction: column
        width:          100%
    
    .model-button
        display:         flex
        align-items:     center
        gap:             16px
        width:           100%
        min-height:      space.$input-initial-height
        box-sizing:      border-box
        padding:         $model-padding
        border-radius:   8px
        border:          1px solid transparent
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s

        .icon
            width: 24px
        
        .name
            flex-grow:   1
            font-size:   14px
            font-weight: 600
            line-height: 21px
            text-align:  left
        
        .prices
            display:         flex
            flex-direction:  column
            justify-content: center
            align-items:     flex-end
            font-family:     font.$mono
            font-size:       10.5px
            font-weight:     500
            color:           $blue-grey
            line-height:     16px
        
        &:hover
            background-color: $background-darker
            transition:       none
            
        &:active
            background-color: $background-darkest
            transform:        scale(0.99)
            transition:       none
            
        &.active
            border:           1px solid $blue
            background-color: $background-darker
</style>
