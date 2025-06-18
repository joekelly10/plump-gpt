<script>
    import ModelButton from '$lib/components/ModelList/ModelButton.svelte'

    let {
        // actions
        focusInput,
        closeModelList,

        // bindable
        is_hovering_default = $bindable(false),
        is_hovering_prices  = $bindable(false),

        // passive
        family,
        models,
    } = $props()
</script>

<div class='model-family'>
    <div class='heading'>
        {family}
    </div>
    <div class='models'>
        {#each models as model}
            <ModelButton
                bind:is_hovering_default
                bind:is_hovering_prices
                model={model}
                focusInput={focusInput}
                closeModelList={closeModelList}
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
