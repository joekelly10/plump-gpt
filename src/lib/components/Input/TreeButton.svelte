<script>
    import { tree_active } from '$lib/stores/app'
    import { forks, active_fork } from '$lib/stores/chat'
    import { is_idle } from '$lib/stores/api.js'

    import ForkIcon from '$lib/components/Icons/Fork.svelte'

    const clicked = () => {
        if ($is_idle) $tree_active = true
    }

    const keydown = (e) => {
        if ((e.ctrlKey && e.key === 'v')) {
            e.preventDefault()
            if ($is_idle) $tree_active = !$tree_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<div class='tree-button-container'>
    <button class='tree-button' on:click={clicked}>
        <ForkIcon className='icon' />
        <span class='text'>
            Tree
            <span class='bull'>
                &rarr;
            </span>
            {$active_fork + 1} / {$forks.length}
        </span>
    </button>
</div>

<style lang='sass'>
    .tree-button-container
        position: absolute
        top:      0
        left:     16px
        height:   100%
        
        :global
            .tree-button
                display:         flex
                align-items:     center
                justify-content: center
                gap:             16px
                height:          100%
                box-sizing:      border-box
                padding-left:    space.$default-padding + 0.75px
                padding-right:   space.$default-padding + 0.75px
                line-height:     font.$line-height-14px
                text-align:      left
                font-size:       14px
                font-weight:     450
                color:           $background-lightest
                cursor:          pointer

                .icon
                    height: 15px
                    fill:   $background-lightest
                
                .text
                    .bull
                        margin: 0 6px

                &:hover,
                &:active
                    padding-left:     space.$default-padding
                    padding-right:    space.$default-padding
                    background-color: $background-darkest
                    font-weight:      600
                    color:            $off-white

                    .icon
                        fill: $off-white
                
                &:active
                    background-color: color.adjust($background-darkest, $lightness: -1%)
</style>