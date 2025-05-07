<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    import TopPControl from '$lib/components/Input/TopPControl.svelte'
    import TemperatureControl from '$lib/components/Input/TemperatureControl.svelte'

    export let is_hovering_model_switcher = false
</script>

<div class='model-settings'>
    {#if !is_hovering_model_switcher}
        <div class='controls' in:fade={{ duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
            <TopPControl/>
            <TemperatureControl/>
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
