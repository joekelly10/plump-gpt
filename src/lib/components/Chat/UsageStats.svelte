<script>
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { usage, forks } from '$lib/stores/chat'
    import { messages } from '$lib/stores/chat'

    const { tree_view = false } = $props()

    const unique_models = $derived.by(() => {
        let models = new Set()

        $messages.forEach(m => {
            if (m.model?.id) models.add(m.model.id)
        })

        return models.size
    })

    const cache_used       = $derived($usage.cache_read_tokens > 0 || $usage.cache_write_tokens > 0),
          cost_string      = $derived('$' + ($usage.total_cost / 100).toFixed(5)),
          savings_string   = $derived('$' + ($usage.total_savings / 100).toFixed(5)),
          negative_savings = $derived($usage.total_savings < 0)
</script>

<div
    class='usage-stats'
    class:tree-view={tree_view}
    class:cache-used={cache_used}
    in:slide={{ axis: 'x', delay: 250, duration: 250, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <div class='stat messages'>
        <div class='label'>
            chat
        </div>
        <div class='total-messages'>
            {$usage.total_responses} {$usage.total_responses === 1 ? 'response' : 'responses'}
        </div>
        {#if $forks.length > 1}
            <div class='fork-count' transition:slide={{ axis: 'y', duration: 125, easing: quartOut }}>
                {$forks.length} forks
            </div>
        {/if}
        {#if unique_models > 1}
            <div class='model-count'>
                {unique_models} models
            </div>
        {/if}
    </div>
    <div class='stat tokens'>
        <div class='label'>
            tokens
        </div>
        <div class='input'>
            {$usage.input_tokens.toLocaleString()} input
        </div>
        <div class='output'>
            {$usage.output_tokens.toLocaleString()} output
        </div>
    </div>
    {#if cache_used}
        <div class='stat cache'>
            <div class='label'>
                cache
            </div>
            <div class='read'>
                {$usage.cache_read_tokens.toLocaleString()} read
            </div>
            {#if $usage.cache_write_tokens > 0}
                <div class='write'>
                    {$usage.cache_write_tokens.toLocaleString()} write
                </div>
            {/if}
        </div>
    {/if}
    <div class='stat cost'>
        <div class='label'>
            cost
        </div>
        <div class='total-cost'>
            {cost_string.substring(0,5)}<span class='small'>{cost_string.substring(5)}</span>
        </div>
        {#if $usage.total_savings !== 0}
            <div class='cache-savings'>
                <span class='small' title={negative_savings ? 'Negative savings due to cache write cost' : ''}>
                    ({savings_string} saved)
                </span>
            </div>
        {/if}
    </div>
</div>

<style lang='sass'>
    .usage-stats
        position:    fixed
        top:         space.$header-height
        right:       16px
        padding:     space.$default-padding
        line-height: font.$line-height-14px
        text-align:  right
        font-size:   14px
        font-weight: 450
        color:       $background-200
        white-space: nowrap

        &.tree-view
            top: space.$tree-view-header-height
    
    .stat
        margin-bottom: space.$default-padding

    .label
        font-size:      12px
        font-weight:    600
        text-transform: uppercase
    
    .small
        margin-left: 0.5px
        font-size:   smaller
</style>
