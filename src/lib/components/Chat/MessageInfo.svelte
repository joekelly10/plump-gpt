<script>
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { formatDate } from '$lib/utils/helpers'
    import { getCost } from '$lib/utils/prices'
    import { onMount, onDestroy } from 'svelte'
    import TemperatureIcon from '$lib/components/Icons/Temperature.svelte'

    export let message

    $: temperature_icon_level = message.temperature > 1 ? 4 : Math.round(message.temperature / 0.25)
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
        <div class='model-settings'>
            <div class='top-p-icon'>
                <div class='fill' style='height:{message.top_p * 100}%'></div>
            </div>
            {message.top_p.toFixed(message.top_p * 10 % 1 === 0 ? 1 : 2)}
            <TemperatureIcon level={temperature_icon_level} className='temperature-icon' />
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
    
        :global
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
                    display:        inline-block
                    vertical-align: middle
                    margin:         -3px 2px 0 8px
                    height:         16px
                    fill:           $background-lightest

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
