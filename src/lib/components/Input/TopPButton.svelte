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

<button class='top_p-button' title='Adjust top_p (Ctrl+P)' onclick={clicked} oncontextmenu={rightClicked}>
    <div class='icon'>
        <div class='fill' style='height:{$top_p * 100}%'></div>
    </div>
    <div class='label'>
        <div class='title'>
            Top %
        </div>
        <div class='value'>
            {display_value}
        </div>
    </div>
</button>

<style lang='sass'>
    .top_p-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$input-initial-height
        padding:         0 space.$default-padding
        border-radius:   8px
        font-size:       12px
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            margin-right:  14px
            width:         4px
            height:        14px
            border-radius: 3px
            border:        1px solid $background-200
            transition:    border-color easing.$quart-out 0.1s

            .fill
                background-color: $background-200
                transition:       background-color easing.$quart-out 0.1s
        
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
                border-color: $off-white
                transition:   none

                .fill
                    background-color: $off-white
                    transition:       none
        
        &:active
            background-color: color.adjust($background-800, $lightness: -1%)
            transition:       none
    
    @media (max-width: 1484px)
        .top_p-button
            display: none
</style>
