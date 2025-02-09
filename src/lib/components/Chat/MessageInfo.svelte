<script>
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate } from '$lib/utils/helpers'
    import { getCost } from '$lib/utils/prices'
    import { onMount, onDestroy } from 'svelte'

    export let message

    $: temperature_icon_class = 'show-temperature-icon-' + (message.temperature > 1 ? '4' : Math.round(message.temperature / 0.25))
    $: cost                   = getCost(message.model.id, message.usage)
    $: cost_string            = '$' + (cost.total / 100).toFixed(5)
    $: savings_string         = '$' + (cost.cache_savings / 100).toFixed(5)

    let cache_duration,
        timeleft,
        timer

    function updateTimeleft() {
        const now       = new Date(),
              timestamp = new Date(message.timestamp),
              expiry    = timestamp.getTime() + cache_duration,
              diff      = expiry - now.getTime()

        if (diff > 0) {
            const minutes = Math.floor(diff / 60000),
                  seconds = Math.floor((diff % 60000) / 1000)
            timeleft = `${minutes}:${seconds.toString().padStart(2, '0')}`
        } else {
            timeleft = 'Expired'
            clearInterval(timer)
        }
    }

    onMount(() => {
        if (message.is_last) {
            if (message.model.type === 'anthropic' && message.usage.cache_write_tokens > 0) {
                cache_duration = 5 * 60 * 1000
            } else if (message.model.type === 'open-ai' && (message.usage.cache_read_tokens > 0 || message.usage.input_tokens > 1024)) {
                cache_duration = 10 * 60 * 1000
            }
            if (cache_duration) {
                updateTimeleft()
                timer = setInterval(updateTimeleft, 1000)
            }
        }
    })

    onDestroy(() => {
        clearInterval(timer)
    })
</script>

<div class='message-info' in:slide={{ axis: 'x', duration: 150, easing: quartOut }} out:fade={{ duration: 150, easing: quartOut }}>
    <div class='inner'>
        <div class='model-name'>
            {message.model.name}
        </div>
        <div class='model-settings {temperature_icon_class}'>
            <div class='top-p-icon'>
                <div class='fill' style='height:{message.top_p * 100}%'></div>
            </div>
            {message.top_p.toFixed(message.top_p * 10 % 1 === 0 ? 1 : 2)}
            <svg class='temperature-icon temperature-icon-0' viewBox='0 0 24 24'><path d='M12,15a2,2,0,1,0,2,2A2,2,0,0,0,12,15Zm4.5-2V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
            <svg class='temperature-icon temperature-icon-1' viewBox='0 0 24 24'><path d='M16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6ZM13,15.28V12.5a1,1,0,0,0-2,0v2.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28Z'></path></svg>
            <svg class='temperature-icon temperature-icon-2' viewBox='0 0 24 24'><path d='M13,15.28V10.5a1,1,0,0,0-2,0v4.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
            <svg class='temperature-icon temperature-icon-3' viewBox='0 0 24 24'><path d='M13,15.28V8.5a1,1,0,0,0-2,0v6.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-5.32-6,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
            <svg class='temperature-icon temperature-icon-4' viewBox='0 0 24 24'><path d='M13,15.28V5.5a1,1,0,0,0-2,0v9.78A2,2,0,0,0,10,17a2,2,0,0,0,4,0A2,2,0,0,0,13,15.28ZM16.5,13V5.5a4.5,4.5,0,0,0-9,0V13a6,6,0,0,0,3.21,9.83A7,7,0,0,0,12,23,6,6,0,0,0,16.5,13Zm-2,7.07a4,4,0,0,1-6.42-2.2,4,4,0,0,1,1.1-3.76,1,1,0,0,0,.3-.71V5.5a2.5,2.5,0,0,1,5,0v7.94a1,1,0,0,0,.3.71,4,4,0,0,1-.28,6Z'></path></svg>
            {message.temperature.toFixed(1)}
        </div>
        <div class='timestamp'>
            {@html message.timestamp ? formatDate(message.timestamp) : ''}
        </div>
        <div class='usage'>
            {message.usage.input_tokens} in / {message.usage.output_tokens} out
            {#if message.usage.cache_read_tokens > 0 || message.usage.cache_write_tokens > 0}
                <br>
                {message.usage.cache_read_tokens} read / {message.usage.cache_write_tokens} write
            {/if}
        </div>
        <div class='cost'>
            {cost_string.substring(0,5)}<span class='small'>{cost_string.substring(5)}</span>
            {#if cost.cache_savings !== 0}
                <br>
                <span class='small'>
                    ({savings_string} saved)
                </span>
            {/if}
        </div>
        {#if timeleft && timeleft !== 'Expired'}
            <div class='timeleft'>
                Cache: {timeleft}
            </div>
        {/if}
    </div>
</div>

<style lang='sass'>
    .message-info
        position:    absolute
        left:        0 - space.$default-padding
        top:         space.$default-padding - 7px
        transform:   translateX(-100%)
        font-size:   14px
        line-height: font.$line-height-14px
        text-align:  right
        color:       $background-lightest
        white-space: nowrap

        .inner
            min-width: 128px
    
    .model-settings
        .top-p-icon
            display:        inline-block
            vertical-align: middle
            margin:         -3px 5px 0 0
            width:          4px
            height:         13px
            border-radius:  3px
            border:         1px solid $background-lightest

            .fill
                background-color: $background-lightest
        
        .temperature-icon
            display:        none
            vertical-align: middle
            margin:         -3px 2px 0 8px
            height:         16px
            fill:           $background-lightest

        &.show-temperature-icon-0
            .temperature-icon-0
                display: inline-block
        &.show-temperature-icon-1
            .temperature-icon-1
                display: inline-block
        &.show-temperature-icon-2
            .temperature-icon-2
                display: inline-block
        &.show-temperature-icon-3
            .temperature-icon-3
                display: inline-block
        &.show-temperature-icon-4
            .temperature-icon-4
                display: inline-block

    .timestamp
        margin-top: 22.5px

    .timeleft
        margin-top:  22.5px
        font-weight: 600
        color:       $yellow
    
    .small
        margin-left: 0.5px
        font-size:   smaller
</style>
