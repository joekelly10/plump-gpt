<script>
    import { top_p } from '$lib/stores/ai'

    const display_value = $derived($top_p.toFixed($top_p * 10 % 1 === 0 ? 1 : 2))
    
    const clicked = (e) => {
        e.preventDefault()
        if (e.shiftKey) return top_p.decrement()
        top_p.increment()
    }
    
    const rightClicked = (e) => {
        e.preventDefault()
        top_p.decrement()
    }
</script>

<button
    class='main-menu-button top_p-button'
    onclick={clicked}
    oncontextmenu={rightClicked}
>
    <div class='title'>
        Top %
    </div>
    <div class='value'>
        <div class='icon'>
            <div class='fill' style='height:{$top_p * 100}%'></div>
        </div>
        <div class='display-value'>
            {display_value}
        </div>
    </div>
</button>

<style lang='sass'>
    .top_p-button
        .value
            display:     flex
            align-items: center

        .icon
            margin-right:  14px
            width:         4px
            height:        14px
            border-radius: 3px
            border:        1px solid $blue-grey
            transition:    border-color easing.$quart-out 0.1s

            .fill
                background-color: $blue-grey
                transition:       background-color easing.$quart-out 0.1s
        
        &:hover
            .icon
                border-color: $off-white
                transition:   none

                .fill
                    background-color: $off-white
                    transition:       none
</style>
