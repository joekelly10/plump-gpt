<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
    import { is_initialising, model_list_active, user_settings_active, input_expanded } from '$lib/stores/app'
    import { getPrices } from '$lib/utils/prices'

    let {
        // actions
        focusInput,

        // bindable
        hovering = $bindable(false)
    } = $props()

    let animate_model_change = $state(false)

    const prices            = $derived(getPrices($model)),
          input_price_text  = $derived(prices.input  === 0 ? 'Free' : `$${(prices.input * 10000).toFixed(2)}`),
          output_price_text = $derived(prices.output === 0 ? 'Free' : `$${(prices.output * 10000).toFixed(2)}`)

    $effect(() => { $model; modelWasChanged() })

    const modelWasChanged = () => {
        animate_model_change = true
        setTimeout(() => { animate_model_change = false }, 5)
    }

    const mouseenter = () => {
        hovering = true
    }

    const mouseleave = () => {
        hovering = false
    }

    const clicked = () => {
        $user_settings_active = false
        $input_expanded       = false
        $model_list_active    = !$model_list_active
        focusInput()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        focusInput()
        return false
    }

    const onwheel = (e) => {
        e.preventDefault()
        if (e.deltaY > 0) {
            model.next()
        } else {
            model.prev()
        }
        return false
    }
</script>

<button 
    class='active-model-button'
    class:animate-model-change={animate_model_change}
    onclick={clicked}
    oncontextmenu={rightClicked}
    onmouseenter={mouseenter}
    onmouseleave={mouseleave}
    onwheel={onwheel}
>
    {#if $is_initialising}
        <div class='initialising-spinner'>
            <img class='spinner-img' src='/img/icons/cog.png' alt='Initialising...'>
        </div>
    {:else}
        <img class='icon' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
    {/if}
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
    .active-model-button
        display:          flex
        flex-wrap:        nowrap
        align-items:      center
        position:         absolute
        top:              -1px
        right:            100%
        margin-right:     space.$default-padding
        height:           space.$input-initial-height
        padding:          0 16px
        border-radius:    8px
        background-color: transparent
        cursor:           pointer
        transition:       padding easing.$quart-out 0.25s, background-color easing.$quart-out 0.1s

        &:hover
            padding:          20px space.$default-padding
            background-color: $background-800
            transition:       padding easing.$quart-out 0.25s
        
        &:active
            background-color: $background-850

        &.animate-model-change
            .icon
                transform:  scale(1.2)
                transition: none

    .initialising-spinner
        display:         flex
        align-items:     center
        justify-content: center
        width:           24px
        height:          24px

        .spinner-img
            height:    19px
            animation: animation.$spinner-animation

    .icon
        height:     24px
        transition: transform easing.$quart-out 0.25s
    
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
        font-size:      10px
        font-weight:    500
        color:          $blue-grey
        text-align:     right
        line-height:    16px
</style>
