<script>
    import { usage, forks } from '$lib/stores/chat'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    $: cache_used     = $usage.cache_read_tokens > 0 || $usage.cache_write_tokens > 0
    $: cost_string    = '$' + ($usage.total_cost / 100).toFixed(5)
    $: savings_string = '$' + ($usage.total_savings / 100).toFixed(5)
</script>

<div
    class='usage-stats'
    class:cache-used={cache_used}
    in:slide={{ axis: 'x', delay: 250, duration: 250, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <div class='stat messages'>
        <div class='label'>
            chat
        </div>
        <div class='total-messages'>
            {$usage.total_messages} {$usage.total_messages === 1 ? 'message' : 'messages'}
        </div>
        {#if $forks.length > 1}
            <div class='fork-count' transition:slide={{ axis: 'y', duration: 125, easing: quartOut }}>
                {$forks.length} forks
            </div>
        {/if}
    </div>
    <div class='stat tokens'>
        <div class='label'>
            tokens
        </div>
        <div class='input'>
            {$usage.input_tokens} input
        </div>
        <div class='output'>
            {$usage.output_tokens} output
        </div>
    </div>
    {#if cache_used}
        <div class='stat cache'>
            <div class='label'>
                cache
            </div>
            <div class='read'>
                {$usage.cache_read_tokens} read
            </div>
            <div class='write'>
                {$usage.cache_write_tokens} write
            </div>
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
                <span class='small'>
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
        color:       $background-lightest
        white-space: nowrap
    
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
