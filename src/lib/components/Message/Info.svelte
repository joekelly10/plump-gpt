<script>
    import { onMount, onDestroy } from 'svelte'
    import { fade, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_streaming } from '$lib/stores/api'
    import { formatDate } from '$lib/utils/helpers'
    import { getCost } from '$lib/utils/prices'

    import TemperatureIcon from '$lib/components/Icons/Temperature.svelte'

    let { message } = $props()

    let cache_duration

    let timer    = $state(null),
        timeleft = $state('')

    const temperature_icon_level = $derived(message.temperature > 1 ? 4 : Math.round(message.temperature / 0.3)),
          cost                   = $derived(getCost(message.model, message.usage)),
          cost_string            = $derived('$' + (cost.total / 100).toFixed(5)),
          savings_string         = $derived('$' + (cost.cache_savings / 100).toFixed(5))

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

    const updateTimeleft = () => {
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

    const getDisplayValue = (string) => {
        switch (string) {
            case 'minimal': return 'min'
            case 'low':     return 'low'
            case 'medium':  return 'med'
            case 'high':    return 'high'
            default:        return string
        }
    }
</script>

<div class='message-info' in:slide={{ axis: 'x', duration: 150, easing: quartOut }} out:fade={{ duration: 150, easing: quartOut }}>
    <div class='inner'>
        <div class='model-name'>
            {message.model.name}
        </div>
        <div class='model-settings'>
            {#if message.model.type === 'open-ai' && message.model.is_reasoner}
                {#if message.verbosity}
                    <div class='verbosity'>
                        <div class='verbosity-icon {message.verbosity}'></div>
                        {getDisplayValue(message.verbosity)} verbosity
                    </div>
                {/if}
                <div class='reasoning-effort'>
                    <div class='reasoning-effort-icon {message.reasoning_effort}'></div>
                    {getDisplayValue(message.reasoning_effort)} effort
                </div>
            {:else}
                <div class='top-p-icon'>
                    <div class='fill' style='height:{message.top_p * 100}%'></div>
                </div>
                {message.top_p.toFixed(message.top_p * 10 % 1 === 0 ? 1 : 2)}
                <TemperatureIcon level={temperature_icon_level} className='temperature-icon' />
                {message.temperature.toFixed(1)}
            {/if}
        </div>
        {#if $is_streaming}
            <div class='streaming'>
                Streaming...
            </div>
        {:else}
            <div class='timestamp'>
                {@html message.timestamp ? formatDate(message.timestamp) : ''}
            </div>
            <div class='usage'>
                {message.usage.input_tokens} input / {message.usage.output_tokens} output
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
        {/if}
    </div>
</div>

<style lang='sass'>
    $vertical-margin: 22.5px

    .message-info
        position:    absolute
        left:        0 - space.$default-padding
        top:         space.$default-padding - 7px
        transform:   translateX(-100%)
        font-size:   14px
        line-height: font.$line-height-14px
        text-align:  right
        color:       $background-200
        white-space: nowrap

        .inner
            min-width: 128px
        
        .model-settings
            .reasoning-effort-icon
                $size:            18px
                display:          inline-block
                vertical-align:   middle
                margin:           -3px 5px 0 0
                height:           $size
                width:            $size
                mask-image:       url('/img/icons/reasoning-effort-minimal.png')
                mask-size:        contain
                mask-repeat:      no-repeat
                mask-position:    center
                background-color: $background-200
                transition:       background-color easing.$quart-out 0.1s
                &.low
                    mask-image: url('/img/icons/reasoning-effort-low.png')
                &.medium
                    mask-image: url('/img/icons/reasoning-effort-medium.png')
                &.high
                    mask-image: url('/img/icons/reasoning-effort-high.png')
            
            .verbosity-icon
                $size:            16px
                display:          inline-block
                vertical-align:   middle
                margin:           -3px 5px 0 0
                width:            $size
                height:           $size
                mask-size:        contain
                mask-repeat:      no-repeat
                mask-position:    center
                background-color: $background-200
                transition:       background-color easing.$quart-out 0.1s
                &.low
                    mask-image: url('/img/icons/verbosity-low.png')
                &.medium
                    mask-image: url('/img/icons/verbosity-medium.png')
                &.high
                    mask-image: url('/img/icons/verbosity-high.png')
            
            .top-p-icon
                display:        inline-block
                vertical-align: middle  
                margin:         -3px 5px 0 0
                width:          4px
                height:         13px
                border-radius:  3px
                border:         1px solid $background-200

                .fill
                    background-color: $background-200
    
            :global
                .temperature-icon
                    display:        inline-block
                    vertical-align: middle
                    margin:         -3px 2px 0 8px
                    height:         16px
                    fill:           $background-200

    .streaming
        margin-top:  $vertical-margin
        font-style:  italic
        font-weight: 450
        color:       $pale-blue

    .timestamp
        margin-top: $vertical-margin

    .timeleft
        margin-top:  $vertical-margin
        font-weight: 600
        color:       $yellow
    
    .small
        margin-left: 0.5px
        font-size:   smaller
</style>
