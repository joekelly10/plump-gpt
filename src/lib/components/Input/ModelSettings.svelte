<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { screen_width } from '$lib/stores/screen'
    import { model } from '$lib/stores/ai'
    import breakpoints from '$lib/fixtures/breakpoints'

    import TopPButton from '$lib/components/Input/TopPButton.svelte'
    import TemperatureButton from '$lib/components/Input/TemperatureButton.svelte'
    import ReasoningEffortButton from '$lib/components/Input/ReasoningEffortButton.svelte'
    import VerbosityButton from '$lib/components/Input/VerbosityButton.svelte'

    let { is_hovering_model_switcher } = $props()

    const show_top_p            = $derived($model.settings.includes('top_p') && $screen_width >= breakpoints.two_model_settings),
          show_temperature      = $derived($model.settings.includes('temperature') && $screen_width >= breakpoints.one_model_setting),
          show_verbosity        = $derived($model.settings.includes('verbosity') && $screen_width >= breakpoints.gpt5_two_model_settings),
          show_reasoning_effort = $derived($model.settings.includes('reasoning_effort') && $screen_width >= breakpoints.gpt5_one_model_setting)
</script>

<div class='model-settings'>
    {#if !is_hovering_model_switcher}
        <div class='controls' in:fade={{ duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
            {#if show_top_p}
                <TopPButton/>
            {/if}
            {#if show_temperature}
                <TemperatureButton/>
            {/if}
            {#if show_verbosity}
                <VerbosityButton/>
            {/if}
            {#if show_reasoning_effort}
                <ReasoningEffortButton/>
            {/if}
        </div>
    {/if}
</div>

<style lang='sass'>
    .model-settings
        position:     absolute
        top:          space.$input-section-padding
        left:         0
        padding-left: 16px
        
    .controls
        display:   flex
        flex-wrap: nowrap
        height:    space.$input-initial-height
</style>
