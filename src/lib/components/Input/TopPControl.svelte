<script>
    import { top_p } from '$lib/stores/ai'

    const increment = () => {
        if ($top_p === 1) return $top_p = 0.05
        $top_p = ($top_p * 10 + 0.5) / 10
    }

    const decrement = () => {
        if ($top_p === 0.05) return $top_p = 1
        $top_p = ($top_p * 10 - 0.5) / 10
    }
    
    const clicked = (e) => {
        if (e.shiftKey) return decrement()
        increment()
    }
    
    const rightClicked = () => decrement()

    const keydown = (e) => {
        if (e.ctrlKey && e.key === 'p') return increment()
        if (e.ctrlKey && e.shiftKey && e.key === 'P') return decrement()
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='top_p-button' title='Adjust top_p (ctrl+P)' on:click|preventDefault={clicked} on:contextmenu|preventDefault={rightClicked}>
    <div class='icon'>
        <div class='fill' style='height:{$top_p * 100}%'></div>
    </div>
    <div class='label'>
        <div class='title'>
            Top %
        </div>
        <div class='value'>
            {$top_p.toFixed($top_p * 10 % 1 === 0 ? 1 : 2)}
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
        color:           $background-lightest
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            margin-right:  14px
            width:         4px
            height:        14px
            border-radius: 3px
            border:        1px solid $background-lightest
            transition:    border-color easing.$quart-out 0.1s

            .fill
                background-color: $background-lightest
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
            background-color: $background-darkest
            color:            $off-white
            transition:       none

            .icon
                border-color: $off-white
                transition:   none

                .fill
                    background-color: $off-white
                    transition:       none
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
            transition:       none
</style>
