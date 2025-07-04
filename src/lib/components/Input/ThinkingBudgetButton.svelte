<script>
    import { thinking_budget } from '$lib/stores/ai'

    const clicked = (e) => {
        e.preventDefault()
        thinking_budget.increment()
        return e.target.blur()
    }
    
    const rightClicked = (e) => {
        e.preventDefault()
        thinking_budget.decrement()
        return e.target.blur()
    }

    const onwheel = (e) => {
        e.preventDefault()
        if (e.deltaY < 0) {
            thinking_budget.increment()
        } else {
            thinking_budget.decrement()
        }
        return false
    }
</script>

<button class='thinking-budget-button' onclick={clicked} oncontextmenu={rightClicked} onwheel={onwheel}>
    <img class='icon' src='/img/icons/thinking-grey.png' alt='Thinking Budget' />
    <div class='title'>
        Thinking Budget
    </div>
    <div class='value'>
        {#if $thinking_budget === 0}
            <span class='off'>
                off
            </span>
        {:else}
            {$thinking_budget.toLocaleString()} tokens
        {/if}
    </div>
</button>

<style lang='sass'>
    .thinking-budget-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: flex-start
        align-items:     center
        gap:             16px
        padding:         16px
        font-size:       12px
        color:           $blue-grey
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            height: 16px

        .title
            font-weight:    600
            text-transform: uppercase

        .value
            font-weight: 450

            .off
                text-transform: uppercase

        &:hover
            background-color: black(0.075)
            color:            $off-white

            .icon
                filter: brightness(2)
        
        &:active
            background-color: black(0.1)
            color:            $off-white
            transition:       none

            .icon
                filter: brightness(2)
</style>
