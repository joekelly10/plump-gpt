<script>
    import all_models from '$lib/fixtures/models'

    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    import ModelFamily from '$lib/components/ModelList/ModelFamily.svelte'

    export let expanded = false

    let models_by_family = []

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

    onMount(setModelsByFamily)
</script>

<section class='model-list-section'>
    {#if expanded}
        <div 
            class='models-by-family'
            in:slide={{ axis: 'y', duration: 333, easing: quartOut }}
            out:slide={{ axis: 'y', delay: 50, duration: 200, easing: quartOut }}
        >
            <button class='close-button' on:click={() => expanded = false }>
                <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
            </button>
            <div class='list'>
                {#each models_by_family as family}
                    <ModelFamily
                        family={family.family}
                        models={family.models}
                        on:focusInput
                        on:closeModelList={() => expanded = false }
                    />
                {/each}
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
        position: relative

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
            border-radius:    8px 8px 0 0
            border:           1px solid $background-darkest
            border-bottom:    none
            background-color: color.adjust(color.adjust($background, $lightness: -1%), $alpha: -0.05)
            backdrop-filter:  blur(4px)
            overflow-y:       scroll
            +shared.scrollbar

        .close-button
            display:         flex
            align-items:     center
            justify-content: center
            position:        absolute
            top:             0
            right:           7px
            z-index:         10
            width:           space.$header-height
            height:          space.$header-height
            cursor:          pointer
            
            .close-icon
                height: 14px
            
            &:hover
                .close-icon
                    filter: brightness(0.8)
</style>
