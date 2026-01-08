<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { active_tools, context_cache } from '$lib/stores/ai'

    let mount_animation_state = $state('flash')

    onMount(() => {
        if ($context_cache.ttl_mins === 0) context_cache.increment_ttl_mins()
        animateAddedToToolbar()
    })

    const clicked = (e) => {
        e.preventDefault()
        context_cache.increment_ttl_mins()
        return e.target.blur()
    }
    
    const rightClicked = (e) => {
        e.preventDefault()
        if ($context_cache.ttl_mins === 0) {
            active_tools.remove('context_cache')
            return false
        }
        context_cache.decrement_ttl_mins()
        return e.target.blur()
    }

    const onwheel = (e) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            context_cache.increment_ttl_mins()
        } else {
            context_cache.decrement_ttl_mins()
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
    class='context-cache-button mount-animation-{mount_animation_state}'
    onclick={clicked}
    oncontextmenu={rightClicked}
    onwheel={onwheel}
    in:fade={{ delay: 125, duration: 125, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <div class='icon context-cache-icon'></div>
    <div class='title'>
        Context Cache
    </div>
    <div class='value'>
        {#if $context_cache.ttl_mins === 0}
            <span class='off'>
                Off
            </span>
        {:else}
            {$context_cache.ttl_mins} min{$context_cache.ttl_mins === 1 ? '' : 's'}
        {/if}
    </div>
</button>

<style lang='sass'>
    .context-cache-button
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
            $size:            16px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/cache.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey
            transition:       background-color easing.$quart-out 0.1s

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
                background-color: $off-white
                transition:       none
        
        &:active
            background-color: $background-850
            color:            $off-white
            transition:       none

            .icon
                background-color: $off-white
                transition:       none

        &.mount-animation-flash
            background-color: color.mix($blue, color.adjust($background-500, $alpha: -0.75), 10%)
            color:            $off-white
            transition:       none

            .icon
                background-color: $off-white
                transition:       none

        &.mount-animation-fade
            transition: background-color easing.$quart-out 1s, color easing.$quart-out 1s

            .icon
                transition: background-color easing.$quart-out 1s
</style>
