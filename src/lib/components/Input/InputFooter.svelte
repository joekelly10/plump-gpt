<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'

    import ThinkingBudgetButton from '$lib/components/Input/ThinkingBudgetButton.svelte'
    import DiffusingButton from '$lib/components/Input/DiffusingButton.svelte'
</script>

<div
    class='input-footer'
    in:slide={{ axis: 'y', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'y', delay: 250, duration: 125, easing: quartOut }}
>
    {#each $model.controls as control}
        {#if control === 'thinking_budget'}
            <ThinkingBudgetButton/>
        {:else if control === 'diffusing'}
            <DiffusingButton/>
        {/if}
    {/each}
</div>

<style lang='sass'>
    .input-footer
        display:          flex
        flex-wrap:        nowrap
        justify-content:  flex-start
        align-items:      center
        border-radius:    0 0 12px 12px
        background-color: color.adjust($background-500, $alpha: -0.75)
        overflow:         hidden
</style>
