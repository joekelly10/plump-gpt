<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    import TopPButton from '$lib/components/Input/TopPButton.svelte'
    import TemperatureButton from '$lib/components/Input/TemperatureButton.svelte'

    let { is_hovering_model_switcher } = $props()
</script>

<div class='model-settings'>
    {#if !is_hovering_model_switcher}
        <div class='controls' in:fade={{ duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
            <TopPButton/>
            <TemperatureButton/>
        </div>
    {/if}
</div>

<style lang='sass'>
    .model-settings
        position:     absolute
        top:          space.$default-padding
        left:         0
        padding-left: 16px
        
    .controls
        display:   flex
        flex-wrap: nowrap
        height:    space.$input-initial-height
</style>
