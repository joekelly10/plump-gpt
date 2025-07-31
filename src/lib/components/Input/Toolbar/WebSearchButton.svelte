<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model, active_tools, web_search } from '$lib/stores/ai'

    let mount_animation_state = $state('flash')

    onMount(() => {
        if ($web_search.open_ai.search_context_size === 'off') web_search.increment_search_context_size()
        if ($web_search.anthropic.max_uses === 0) web_search.increment_max_uses()
        animateAddedToToolbar()
    })

    const clicked = (e) => {
        e.preventDefault()
        if ($model.type === 'open-ai') {
            web_search.increment_search_context_size()
        } else if ($model.type === 'anthropic') {
            web_search.increment_max_uses()
        }
        return e.target.blur()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        if ($model.type === 'open-ai') {
            if ($web_search.open_ai.search_context_size === 'off') {
                active_tools.remove('web_search')
                return false
            }
            web_search.decrement_search_context_size()
        } else if ($model.type === 'anthropic') {
            if ($web_search.anthropic.max_uses === 0) {
                active_tools.remove('web_search')
                return false
            }
            web_search.decrement_max_uses()
        }
        return e.target.blur()
    }

    const onwheel = (e) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            if ($model.type === 'open-ai') {
                web_search.increment_search_context_size()
            } else if ($model.type === 'anthropic') {
                web_search.increment_max_uses()
            }
        } else {
            if ($model.type === 'open-ai') {
                web_search.decrement_search_context_size()
            } else if ($model.type === 'anthropic') {
                web_search.decrement_max_uses()
            }
        }
        return false
    }

    const animateAddedToToolbar = () => {
        mount_animation_state = 'flash'
        setTimeout(() => { mount_animation_state = 'fade' }, 50)
        setTimeout(() => { mount_animation_state = 'done' }, 1000)
    }
</script>

<button
    class='web-search-button mount-animation-{mount_animation_state}'
    onclick={clicked}
    oncontextmenu={rightClicked}
    onwheel={onwheel}
    in:fade={{ delay: 125, duration: 125, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <img class='icon' src='/img/icons/web-search-grey.png' alt='Web Search' />
    <div class='title'>
        Web Search
    </div>
    <div class='value'>
        {#if ($model.type === 'anthropic' && $web_search.anthropic.max_uses === 0) || ($model.type === 'open-ai' && $web_search.open_ai.search_context_size === 'off')}
            <span class='off'>
                Off
            </span>
        {:else}
            {#if $model.type === 'open-ai'}
                {$web_search.open_ai.search_context_size.charAt(0).toUpperCase() + $web_search.open_ai.search_context_size.slice(1)}
            {:else if $model.type === 'anthropic'}
                {$web_search.anthropic.max_uses} max
            {/if}
        {/if}
    </div>
</button>

<style lang='sass'>
    .web-search-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: flex-start
        align-items:     center
        gap:             16px
        padding:         16px 24px
        font-size:       12px
        color:           $blue-grey
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            height:     16px
            transition: filter easing.$quart-out 0.1s

        .title
            font-weight:    600
            text-transform: uppercase

        .value
            font-weight: 450

            .off
                text-transform: uppercase

        &:hover
            background-color: $background-800
            color:            $off-white
            transition:       none

            .icon
                filter:     brightness(2)
                transition: none
        
        &:active
            background-color: $background-850
            color:            $off-white
            transition:       none

            .icon
                filter:     brightness(2)
                transition: none

        &.mount-animation-flash
            background-color: color.mix($blue, color.adjust($background-500, $alpha: -0.75), 10%)
            color:            $off-white
            transition:       none

            .icon
                filter:     brightness(2)
                transition: none

        &.mount-animation-fade
            transition: background-color easing.$quart-out 1s, color easing.$quart-out 1s

            .icon
                transition: filter easing.$quart-out 1s
</style>
