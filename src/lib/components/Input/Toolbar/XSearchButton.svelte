<script>
    import { onMount } from 'svelte'
    import { fade, fly, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tool_list_active } from '$lib/stores/app'
    import { x_search } from '$lib/stores/ai'

    let mount_animation_state = $state('flash'),
        controls_visible      = $state(false)

    onMount(() => {
        animateAddedToToolbar()
    })

    const clicked = (e) => {
        e.preventDefault()
        controls_visible = !controls_visible
        $tool_list_active = false
        return e.target.blur()
    }

    const rightClicked = (e) => {
        e.preventDefault()
        controls_visible = false
        return e.target.blur()
    }

    const incrementViews = (e) => {
        e.preventDefault()
        x_search.increment_post_view_count()
    }

    const decrementViews = (e) => {
        e.preventDefault()
        x_search.decrement_post_view_count()
    }

    const incrementFavorites = (e) => {
        e.preventDefault()
        x_search.increment_post_favorite_count()
    }

    const decrementFavorites = (e) => {
        e.preventDefault()
        x_search.decrement_post_favorite_count()
    }

    const close = () => {
        controls_visible = false
    }

    const animateAddedToToolbar = () => {
        mount_animation_state = 'flash'
        setTimeout(() => { mount_animation_state = 'fade' }, 50)
        setTimeout(() => { mount_animation_state = 'done' }, 1000)
    }
</script>

<button
    class='x-search-button mount-animation-{mount_animation_state}'
    class:controls-visible={controls_visible}
    onclick={clicked}
    oncontextmenu={rightClicked}
    in:fade={{ delay: 125, duration: 125, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <img class='icon' src='/img/icons/x-grey.png' alt='X Search' />
    <div class='title'>
        X Search
    </div>
    <div class='value'>
        Min: {$x_search.post_view_count.toLocaleString()} views • {$x_search.post_favorite_count.toLocaleString()} likes
    </div>
</button>

{#if controls_visible}
    <div class='controls x-search-controls' in:slide={{ duration: 125, easing: quartOut }} out:slide={{ duration: 75, easing: quartOut }}>
        <div class='controls-header'>
            <img class='controls-header-icon' src='/img/icons/x-grey.png' alt='X Search' />
            Search Options
            <button class='close-button' onclick={close}>
                <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
            </button>
        </div>
        <button class='control-button views-button' onclick={incrementViews} oncontextmenu={decrementViews}>
            Minimum views:
            <strong>
                {$x_search.post_view_count.toLocaleString()}
            </strong>
        </button>
        <button class='control-button favorites-button' onclick={incrementFavorites} oncontextmenu={decrementFavorites}>
            Minimum likes:
            <strong>
                {$x_search.post_favorite_count.toLocaleString()}
            </strong>
        </button>
    </div>
{/if}

<style lang='sass'>
    .x-search-button
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

        &.controls-visible
            background-color: $background-700

        .icon
            height:     16px
            transition: filter easing.$quart-out 0.1s

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
    
    .controls
        display:          flex
        flex-direction:   column
        position:         fixed
        bottom:           82px
        left:             50%
        z-index:          1000
        transform:        translateX(-0.5 * space.$input-container-width)
        width:            space.$input-container-width
        box-sizing:       border-box
        border-radius:    12px 12px 0 0
        border:           1px solid $blue-grey
        border-bottom:    1px solid $background-700
        background-color: color.adjust(color.adjust($background-500, $lightness: -1%), $alpha: -0.05)
        backdrop-filter:  blur(4px)
        color:            $off-white
        overflow:         hidden

        .controls-header
            display:          flex
            align-items:      center
            height:           space.$header-height
            padding:          0 space.$default-padding
            border-bottom:    1px solid $background-700
            background-color: $background-700
            font-size:        12px
            font-weight:      600
            text-transform:   uppercase
            color:            $blue-grey

            .controls-header-icon
                height:       16px
                margin-right: 12px
            
            .close-button
                display:         flex
                align-items:     center
                justify-content: center
                position:        absolute
                top:             0
                right:           0
                z-index:         10
                width:           space.$header-height + 12px
                height:          space.$header-height
                cursor:          pointer
                
                .close-icon
                    height: 14px
                
                &:hover
                    .close-icon
                        filter: brightness(0.8)

        .control-button
            display:       flex
            align-items:   center
            gap:           8px
            height:        space.$header-height
            padding:       0 space.$default-padding
            border-bottom: 1px solid $background-700
            font-size:     14px
            cursor:        pointer

            &:last-child
                border-bottom: none
            
            &:hover
                background-color: $background-800

            &:active
                background-color: $background-850
</style>
