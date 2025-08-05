<script>
    import all_models from '$lib/fixtures/models'

    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model_list_active } from '$lib/stores/app'

    import ModelFamily from '$lib/components/ModelList/ModelFamily.svelte'
    import HoverInfoDefaultModel from '$lib/components/ModelList/HoverInfoDefaultModel.svelte'
    import HoverInfoPrices from '$lib/components/ModelList/HoverInfoPrices.svelte'

    let { focusInput } = $props()

    let models_by_family    = $state([]),
        is_hovering_default = $state(false),
        is_hovering_prices  = $state(false)
    
    onMount(() => { setModelsByFamily() })

    const setModelsByFamily = () => {
        all_models.forEach(model => {
            let existing = models_by_family.find(m => m.family === model.family)
            if (existing) {
                existing.models.push(model)
            } else {
                models_by_family.push({
                    family: model.family,
                    models: [model]
                })
            }
        })
    }

    const close = () => {
        $model_list_active = false
    }
</script>

<section class='model-list-section'>
    {#if $model_list_active}
        <div 
            class='models-by-family'
            in:slide={{ axis: 'y', duration: 333, easing: quartOut }}
            out:slide={{ axis: 'y', delay: 50, duration: 200, easing: quartOut }}
        >
            <div class='header'>
                <div class='title'>
                    Models
                    <span class='bull'>
                        &bull;
                    </span>
                    {all_models.length}
                </div>
                <button class='close-button' onclick={close}>
                    <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
                </button>
            </div>
            <div class='list'>
                {#each models_by_family as family}
                    <ModelFamily
                        bind:is_hovering_default
                        bind:is_hovering_prices
                        family={family.family}
                        models={family.models}
                        focusInput={focusInput}
                        closeModelList={close}
                    />
                {/each}
            </div>
            <div class='hover-info'>
                {#if is_hovering_default}
                    <HoverInfoDefaultModel/>
                {/if}
                {#if is_hovering_prices}
                    <HoverInfoPrices/>
                {/if}
            </div>
        </div>
    {/if}
</section>

<style lang='sass'>
    $button-size: 60px

    .model-list-section
        display:        flex
        flex-direction: column
        align-items:    center
        position:       absolute
        bottom:         100%
        left:           0
        z-index:        1
        width:          100%

    .models-by-family
        display:        flex
        flex-direction: column
        align-items:    center
        position:       relative
        
        .header
            display:          flex
            align-items:      center
            flex-shrink:      0
            width:            100%
            height:           space.$header-height
            box-sizing:       border-box
            border-radius:    12px 12px 0 0
            background-color: $background-700

            .title
                padding:     0 space.$default-padding
                font-size:   14px
                font-weight: 600

                .bull
                    margin: 0 5px
                    color:  $blue
            
            .close-button
                display:         flex
                align-items:     center
                justify-content: center
                position:        absolute
                top:             0
                right:           0
                z-index:         10
                width:           space.$header-height + 12px
                height:          space.$header-height
                cursor:          pointer
                
                .close-icon
                    height: 14px
                
                &:hover
                    .close-icon
                        filter: brightness(0.8)

        .list
            display:          flex
            justify-content:  flex-start
            align-items:      flex-start
            flex-wrap:        wrap
            gap:              space.$header-height
            width:            3 * space.$model-family-width + 4 * space.$header-height + 10px
            height:           640px
            box-sizing:       border-box
            padding:          space.$header-height
            border-left:      1px solid $background-700
            border-right:     1px solid $background-700
            background-color: $modal-blur-bg-color
            backdrop-filter:  blur(4px)
            overflow-y:       scroll
            +shared.scrollbar
        
        .hover-info
            position:       absolute
            bottom:         32px
            right:          32px
            z-index:        1000
            pointer-events: none
</style>
