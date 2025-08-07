<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { main_menu_active, model_list_active, input_expanded } from '$lib/stores/app'

    let { input_overflowed } = $props()

    const show = $derived(input_overflowed || $input_expanded)

    const toggleExpanded = () => {
        $main_menu_active  = false
        $model_list_active = false
        $input_expanded    = !$input_expanded
    }
</script>

{#if show}
    <button
        class='expand-button'
        class:expanded={$input_expanded}
        onclick={toggleExpanded}
        in:slide={{ axis: 'y', delay: 125, duration: 125, easing: quartOut }}
        out:slide={{ axis: 'y', duration: 125, easing: quartOut }}
    >
        <span class='up-arrow'>
            ↑
        </span>
        <span class='down-arrow'>
            ↓
        </span>
    </button>
{/if}

<style lang='sass'>
    $margin: 10px

    .expand-button
        display:          flex
        align-items:      center
        justify-content:  center
        position:         absolute
        top:              space.$default-padding + 12px
        left:             50%
        z-index:          5
        transform:        translateX(-50%) translateY(-100%)
        min-width:        space.$input-container-width-min - 2 * $margin
        max-width:        space.$input-container-width-pre-max - 2 * $margin
        width:            calc(space.$input-container-width - 2 * $margin)
        height:           56px
        padding-bottom:   12px
        border-radius:    8px 8px 0 0
        background-color: $background-800
        background-color: color.adjust($background-700, $lightness: -1.75%)
        color:            $off-white
        font-size:        19px
        cursor:           pointer

        &:hover
            background-color: $background-800

            .up-arrow
                color: $off-white

        &:active
            background-color: $background-850

        .up-arrow
            display: block
            color:   $blue-grey

        .down-arrow
            display: none

        &.expanded
            .up-arrow
                display: none

            .down-arrow
                display: block
    
    @media (min-width: space.$input-container-pre-max-breakpoint)
        .expand-button
            max-width: space.$input-container-width-max - 2 * $margin
</style>
