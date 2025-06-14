<script>
    import { createEventDispatcher } from 'svelte'

    import PageControls from '$lib/components/Loader/PageControls.svelte'

    const dispatch = createEventDispatcher()

    export let filter,
               search_input,
               search_value,
               searched_value,
               search_timer,
               total_chats,
               total_pages,
               active_page

    export const focus          = () => search_input.focus()
    export const unfocus        = () => search_input.blur()
    export const is_focused     = () => document.activeElement === search_input
    export const scrollIntoView = () => search_input.scrollIntoView({ behavior: 'smooth', block: 'end' })
    export const clear_timer    = () => clearTimeout(search_timer)
    export const set_searched   = (value) => search_value = value

    $: searchValueChanged(search_value)

    const searchValueChanged = (_) => {
        clearTimeout(search_timer)
        search_timer = setTimeout(() => {
            active_page = 1
            dispatch('fetchChats')
        }, 250)
    }

    const clickedAll = () => {
        filter      = 'all'
        active_page = 1
        dispatch('fetchChats')
    }

    const clickedStarred = () => {
        filter      = 'starred'
        active_page = 1
        dispatch('fetchChats')
    }

    const clickedNonDefault = () => {
        filter      = 'non-default'
        active_page = 1
        dispatch('fetchChats')
    }
</script>

<div class='search-header'>
    <div class='search-options'>
        <div class='search-option-buttons-container'>
            <button class='search-option-button all-button' class:active={filter === 'all'} on:click={clickedAll}>
                All
            </button>
            <div class='separator'></div>
            <button class='search-option-button starred-button' class:active={filter === 'starred'} on:click={clickedStarred}>
                Starred
            </button>
            <div class='separator'></div>
            <button class='search-option-button non-default-button' class:active={filter === 'non-default'} on:click={clickedNonDefault}>
                Non-default
            </button>
        </div>
    </div>
    <div class='search-container'>
        <input
            type='text'
            class='search-input'
            placeholder='Search...'
            bind:this={search_input}
            bind:value={search_value}
            tabindex=1
        />
    </div>
    <div class='search-results'>
        <div class='total-chats'>
            {total_chats} {total_chats === 1 ? 'result' : 'results'}
            {#if searched_value}
                for “{searched_value}”
            {/if}
        </div>
        <div class='page-controls-container'>
            <PageControls
                bind:active_page={active_page}
                bind:total_pages={total_pages}
                on:prevPage
                on:nextPage
            />
        </div>
    </div>
    <button class='close-button' on:click={() => dispatch('close')}>
        <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
    </button>
</div>

<style lang='sass'>
    $width: 720px

    .search-header
        margin-bottom:    space.$default-padding
        padding:          space.$default-padding 0 12px
        background-color: $background-800
        text-align:       center
        user-select:      none

    .search-options
        margin:       0 auto space.$default-padding
        width:        $width
        box-sizing:   border-box
        padding-left: 12px
        color:        $blue-grey

        .search-option-buttons-container
            display:     flex
            align-items: center
            gap:         20px

            .separator
                width:            1px
                height:           12px
                background-color: white(0.2)

        .search-option-button
            padding:       7px 12px
            border-radius: 6px
            font-weight:   450
            cursor:        pointer

            &:hover
                color: $off-white

            &.active
                font-weight: 600
                color:       $background-800

                &.all-button
                    background-color: $off-white

                &.starred-button
                    background-color: $yellow

                &.non-default-button
                    background-color: $blue

    .search-container
        margin:           0 auto
        width:            $width
        box-sizing:       border-box
        padding:          16px 20px
        border:           1px solid $blue-grey
        border-radius:    12px
        background-color: $background-300

        &:focus-within
            border-color: $blue
            box-shadow:   0 0 0 1px $blue

        .search-input
            width:            100%
            box-sizing:       border-box
            padding-right:    16px
            line-height:      font.$line-height-20px
            text-align:       left
            font-family:      font.$sans-serif
            font-size:        20px
            font-weight:      600
            color:            white
            caret-color:      $blue
            background-color: transparent
            border:           none
            resize:           none

            &::placeholder
                color:       $blue-grey
                font-weight: 500

            &:focus
                outline: none
    
    .search-results
        display:         flex
        justify-content: space-between
        align-items:     center
        margin:          0 auto
        width:           $width
        box-sizing:      border-box
        padding-top:     12px
        padding-left:    12px
        line-height:     64px

        .total-chats
            font-weight: 600

        .page-controls-container
            margin-right: -12px
    
    .close-button
        position:    fixed
        top:         0
        right:       0
        padding:     24px space.$default-padding
        font-weight: 500
        cursor:      pointer

        .close-icon
            height: 16px
        
        &:hover
            .close-icon
                filter: brightness(0.8)
</style>
