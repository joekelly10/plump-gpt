<script>
    import PageControls from '$lib/components/Loader/PageControls.svelte'

    export const focus          = () => search_input.focus(),
                 unfocus        = () => search_input.blur(),
                 is_focused     = () => document.activeElement === search_input,
                 scrollIntoView = () => search_input.scrollIntoView({ behavior: 'smooth', block: 'end' }),
                 clear_timer    = () => clearTimeout(search_timer),
                 set_searched   = (value) => search_value = value

    let {
        // actions
        fetchChats,
        nextPage,
        prevPage,
        close,

        // bindable
        filter         = $bindable('all'),
        search_value   = $bindable(''),
        searched_value = $bindable(''),
        active_page    = $bindable(1),

        // passive
        total_chats,
        total_pages
    } = $props()

    let search_input,
        search_timer
    
    $effect(() => { search_value; whenSearchValueChanges() })

    const whenSearchValueChanges = () => {
        clearTimeout(search_timer)
        search_timer = setTimeout(() => {
            active_page = 1
            fetchChats()
        }, 250)
    }

    const clickedAll = () => {
        filter      = 'all'
        active_page = 1
        fetchChats()
    }

    const clickedStarred = () => {
        filter      = 'starred'
        active_page = 1
        fetchChats()
    }

    const clickedNonDefault = () => {
        filter      = 'non-default'
        active_page = 1
        fetchChats()
    }
</script>

<div class='search-header'>
    <div class='search-options'>
        <div class='search-option-buttons-container'>
            <button class='search-option-button all-button' class:active={filter === 'all'} onclick={clickedAll}>
                All
            </button>
            <div class='separator'></div>
            <button class='search-option-button starred-button' class:active={filter === 'starred'} onclick={clickedStarred}>
                Starred
            </button>
            <div class='separator'></div>
            <button class='search-option-button non-default-button' class:active={filter === 'non-default'} onclick={clickedNonDefault}>
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
                active_page={active_page}
                total_pages={total_pages}
                prevPage={prevPage}
                nextPage={nextPage}
            />
        </div>
    </div>
    <button class='close-button' onclick={close}>
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
