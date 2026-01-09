<script>
    import { onMount } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { thinking_level } from '$lib/stores/ai'
    import { model } from '$lib/stores/ai'

    const display_value = $derived($thinking_level.charAt(0).toUpperCase() + $thinking_level.slice(1))

    $effect(() => {
        if ($model.hasOwnProperty('custom') && $model.custom.hasOwnProperty('thinking_level')) {
            const available_levels = $model.custom.thinking_level.levels ?? ['low', 'high'],
                  default_level    = $model.custom.thinking_level.default ?? 'high'

            if (!available_levels.includes($thinking_level)) thinking_level.set(default_level)
        }
    })

    const clicked = (e) => {
        e.preventDefault()
        if (e.shiftKey) return decrement()
        increment()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        decrement()
    }

    const increment = () => {
        const available_levels = $model.custom?.thinking_level?.levels ?? ['low', 'high'],
              current_index    = available_levels.indexOf($thinking_level)

        if (current_index === -1) {
            const default_level = $model.custom?.thinking_level?.default ?? 'high'
            thinking_level.set(default_level)
            return
        }

        if (current_index === available_levels.length - 1) {
            thinking_level.set(available_levels[0])
            return
        }

        thinking_level.set(available_levels[current_index + 1])
    }

    const decrement = () => {
        const available_levels = $model.custom?.thinking_level?.levels ?? ['low', 'high'],
              current_index    = available_levels.indexOf($thinking_level)

        if (current_index === -1) {
            const default_level = $model.custom?.thinking_level?.default ?? 'high'
            thinking_level.set(default_level)
            return
        }

        if (current_index === 0) {
            thinking_level.set(available_levels[available_levels.length - 1])
            return
        }

        thinking_level.set(available_levels[current_index - 1])
    }
</script>

<button
    class='thinking-level-button'
    title='Adjust thinking level'
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:slide={{ axis: 'x', delay: 250, duration: 125, easing: quartOut }}
    out:slide={{ axis: 'x', duration: 75, easing: quartOut }}
>
    <div class='icon {$thinking_level}'></div>
    <div class='label'>
        <div class='title'>
            Thinking Level
        </div>
        <div class='value'>
            {display_value}
        </div>
    </div>
    
</button>

<style lang='sass'>
    .thinking-level-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$input-initial-height
        padding:         0 20px
        border-radius:   8px
        font-size:       12px
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            $size:            18px
            margin-right:     16px
            margin-left:      -6px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/reasoning-effort-none.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $background-200
            transition:       background-color easing.$quart-out 0.1s
            &.minimal
                mask-image: url('/img/icons/reasoning-effort-minimal.png')
            &.low
                mask-image: url('/img/icons/reasoning-effort-low.png')
            &.medium
                mask-image: url('/img/icons/reasoning-effort-medium.png')
            &.high
                mask-image: url('/img/icons/reasoning-effort-high.png')

        .label
            text-align:  left
            line-height: space.$temperature-control-line-height
            white-space: nowrap

            .title
                font-weight:    600
                text-transform: uppercase
            
            .value
                font-weight: 450
        
        &:hover
            background-color: $background-800
            color:            $off-white
            transition:       none

            .icon
                background-color: $off-white
                transition:       none
        
        &:active
            background-color: $background-850
            transition:       none
    
    @media (min-width: 1540px)
        .thinking-level-button
            padding: 0 28px

    @media (min-width: 1600px)
        .thinking-level-button
            padding: 0 space.$default-padding
</style>
