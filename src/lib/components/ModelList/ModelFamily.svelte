<script>
    import ModelButton from '$lib/components/ModelList/ModelButton.svelte'

    export let family,
               models,
               is_hovering_default,
               is_hovering_prices
</script>

<div class='model-family'>
    <div class='heading'>
        {family}
    </div>
    <div class='models'>
        {#each models as model}
            <ModelButton
                model={model}
                on:focusInput
                on:closeModelList
                bind:is_hovering_default
                bind:is_hovering_prices
            />
        {/each}
    </div>
</div>

<style lang='sass'>
    .model-family
        display:        flex
        align-items:    flex-start
        flex-direction: column
        gap:            12px
        width:          space.$model-family-width
        padding-bottom: space.$default-padding

    .heading
        padding-left:   space.$model-list-button-padding
        font-size:      12px
        font-weight:    600
        text-transform: uppercase
        color:          $blue-grey
    
    .models
        display:        flex
        flex-direction: column
        width:          100%
</style>
