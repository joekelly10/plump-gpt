<script>
    let {
        // actions
        prevPage,
        nextPage,

        // passive
        active_page,
        total_pages
    } = $props()
</script>

<div class='page-controls'>
    <button class='prev-page-button' class:disabled={active_page === 1} onclick={prevPage}>
        <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Prev page'>
    </button>
    <span class='current-page'>
        Page {active_page} / {total_pages || 1}
    </span>
    <button class='next-page-button' class:disabled={!(active_page < total_pages)} onclick={nextPage}>
        <img class='arrow' src='/img/icons/chevron-off-white.png' alt='Next page'>
    </button>
</div>

<style lang='sass'>
    .page-controls
        display:         flex
        align-items:     center
        justify-content: center
        gap:             16px
        font-weight:     600
    
    .prev-page-button,
    .next-page-button
        padding:       16px 24px
        border-radius: 8px
        cursor:        pointer

        .arrow
            height: 12px
            filter: brightness(2)
        
        &:hover
            background-color: black(0.05)
        
        &:active
            background-color: black(0.1)

            .arrow
                filter: brightness(0.8)

        &.disabled
            opacity:        0.25
            cursor:         default
            pointer-events: none

    .prev-page-button
        .arrow
            transform: rotate(180deg)
</style>
