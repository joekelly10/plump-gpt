<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    import HighlightIcon from '$lib/components/Icons/Highlight.svelte'

    const {
        onClickQuoteButton,
        onClickHighlightButton,
        highlight_action_position = $bindable({ x: 0, y: 0 })
    } = $props()
</script>

<div
    class='highlight-action'
    style='left: {highlight_action_position.x}px; top: {highlight_action_position.y}px'
    in:fly={{ y: 8, duration: 100, easing: quartOut }}
    out:fly={{ y: 8, duration: 50 }}
>
    <button class='highlight-action-button quote-button' onclick={onClickQuoteButton}>
        <span class='quote-icon'>”</span>
    </button>
    <button class='highlight-action-button add-highlight-button' onclick={onClickHighlightButton}>
        <HighlightIcon className='add-highlight-icon' />
    </button>
</div>

<style lang='sass'>
    .highlight-action
        display:          flex
        align-items:      center
        justify-content:  center
        gap:              1px
        position:         fixed
        z-index:          1
        transform:        translateX(-50%) translateY(-100%)
        height:           35px
        border-radius:    99px
        border:           1px solid $background-800
        background-color: $background-800
        color:            $off-white
        user-select:      none

        &:after
            content:      ''
            position:     absolute
            top:          100%
            left:         50%
            transform:    translateX(-50%)
            border-width: 6px 9px
            border-style: solid
            border-color: $background-800 transparent transparent

    .highlight-action-button
        display:          inline-flex
        align-items:      center
        justify-content:  center
        width:            48px
        height:           100%
        background-color: $background-700
        cursor:           pointer

        &.quote-button
            border-radius: 99px 0 0 99px
        
        &.add-highlight-button
            border-radius: 0 99px 99px 0
    
        &:hover
            background-color: color.adjust($background-700, $lightness: -2%)

            &:after
                border-top-color: color.adjust($background-700, $lightness: -2%)
        
        &:active
            background-color: color.adjust($background-700, $lightness: -4%)

            &:after
                border-top-color: color.adjust($background-700, $lightness: -4%)

        .quote-icon
            transform:   translateY(16.66%)
            font-family: 'Times New Roman', serif
            font-size:   36px
            font-weight: 600
        
        :global(.add-highlight-icon)
            height: 19px
            fill:   $off-white
</style>
