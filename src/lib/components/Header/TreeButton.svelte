<script>
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tree_active } from '$lib/stores/app'
    import { is_idle } from '$lib/stores/api.js'

    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const clicked = () => {
        if ($is_idle) $tree_active = true
    }
</script>

<button class='tree-button'
    on:click={clicked}
    in:slide={{ axis: 'x', delay: 250, duration: 250, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <ForkIcon className='icon' />
    <div class='label'>
        Tree View
    </div>
</button>

<style lang='sass'>
    .tree-button
        display:          flex
        align-items:      center
        justify-content:  center
        gap:              16px
        height:           100%
        box-sizing:       border-box
        padding-left:     space.$default-padding
        padding-right:    space.$default-padding
        background-color: transparent
        line-height:      font.$line-height-14px
        text-align:       left
        font-size:        14px
        font-weight:      600
        color:            $off-white
        cursor:           pointer
        user-select:      none
        transition:       background-color easing.$quart-out 0.1s

        :global(.icon)
            margin-top: 1px
            height:     15px
            fill:       $blue
        
        .label
            text-align:  left
            line-height: space.$temperature-control-line-height
            white-space: nowrap

        &:hover,
        &:active
            background-color: $background-darkest
            transition:       none
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
</style>
