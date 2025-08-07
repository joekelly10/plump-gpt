<script>
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tool_list_active } from '$lib/stores/app'
    import { active_tools } from '$lib/stores/ai'

    import ThinkingBudgetButton from '$lib/components/Input/Toolbar/ThinkingBudgetButton.svelte'
    import ReasoningEffortButton from '$lib/components/Input/Toolbar/ReasoningEffortButton.svelte'
    import WebSearchButton from '$lib/components/Input/Toolbar/WebSearchButton.svelte'
    import GoogleSearchButton from '$lib/components/Input/Toolbar/GoogleSearchButton.svelte'
    import XSearchButton from '$lib/components/Input/Toolbar/XSearchButton.svelte'
    import ExaSearchButton from '$lib/components/Input/Toolbar/ExaSearchButton.svelte'

    const is_empty = $derived($active_tools.length === 0)
</script>

<div
    class='input-toolbar'
    class:is-empty={is_empty}
    class:tool-list-active={$tool_list_active}
    in:slide={{ axis: 'y', duration: 125, easing: quartOut }}
    out:slide={{ axis: 'y', duration: 125, easing: quartOut }}
>
    {#if is_empty}
        <div class='empty-message' in:fade={{ delay: 125, duration: 125, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
            <div class='empty-message-text'>
                No tools selected...
            </div>
        </div>
    {/if}
    {#each $active_tools as tool (tool)}
        {#if tool === 'thinking_budget'}
            <ThinkingBudgetButton/>
        {:else if tool === 'reasoning_effort'}
            <ReasoningEffortButton/>
        {:else if tool === 'web_search'}
            <WebSearchButton/>
        {:else if tool === 'google_search'}
            <GoogleSearchButton/>
        {:else if tool === 'x_search'}
            <XSearchButton/>
        {:else if tool === 'exa_search'}
            <ExaSearchButton/>
        {/if}
    {/each}
</div>

<style lang='sass'>
    .input-toolbar
        display:          flex
        justify-content:  flex-start
        align-items:      center
        flex-wrap:        wrap
        position:         relative
        min-height:       48px
        border-radius:    0 0 12px 12px
        background-color: $background-350
        overflow:         hidden
        transition:       background-color easing.$quart-out 100ms

        &.tool-list-active
            &.is-empty
                background-color: $background-350

            &:not(.is-empty)
                background-color: $toolbar-active-bg

    .empty-message
        display:         flex
        align-items:     center
        justify-content: flex-start
        position:        absolute
        top:             0
        left:            0
        width:           100%
        height:          100%
        box-sizing:      border-box
        padding-left:    24px
        font-size:       12px
        font-weight:     450
        font-style:      italic
        color:           color.adjust($blue-grey, $alpha: -0.5)
</style>
