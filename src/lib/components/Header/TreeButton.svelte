<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tree_active } from '$lib/stores/app'
    import { forks, active_fork } from '$lib/stores/chat'
    import { is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { is_idle } from '$lib/stores/api'

    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const dispatch = createEventDispatcher()

    const clicked = async () => {
        if (!$is_idle) return

        if ($is_provisionally_forking) {
            dispatch('cancelProvisionalFork')
            await tick()
        }

        $tree_active = true
    }
</script>

<button class='tree-button'
    on:click={clicked}
    in:slide={{ axis: 'x', delay: 250, duration: 250, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <ForkIcon className='icon' />
    <div class='label'>
        Tree
        <span class='bull'>
            &bull;
        </span>
        {$active_fork + 1} / {$forks.length}
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

            .bull
                margin: 0 8px
                color:  $blue

        &:hover,
        &:active
            background-color: $background-darkest
            transition:       none
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
</style>
