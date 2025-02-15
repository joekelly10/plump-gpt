<script>
    import { forks, active_fork, tree_active } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai.js'

    const clicked = () => {
        if ($api_status === 'idle') $tree_active = true
    }

    const keydown = (e) => {
        if ((e.ctrlKey && e.key === 'v')) {
            e.preventDefault()
            if ($api_status === 'idle') $tree_active = !$tree_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='tree-button' on:click={clicked}>
    <svg class='icon' viewBox='4 4 16 16' transform='scale(1 -1)'><path d='M19.5 4h-4a.5.5 0 0 0 0 1h2.793l-4.147 4.146a.5.5 0 1 0 .707.707L19 5.707V8.5a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5M5.707 5H8.5a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0V5.707l6.5 6.5V19.5a.5.5 0 0 0 1 0V12a.5.5 0 0 0-.146-.354Z'/></svg>
    <span class='text'>
        Tree
        <span class='bull'>
            &rarr;
        </span>
        {$active_fork + 1} / {$forks.length}
    </span>
</button>

<style lang='sass'>
    .tree-button
        display:         flex
        align-items:     center
        justify-content: center
        gap:             16px
        position:        absolute
        left:            16px
        top:             0
        height:          100%
        box-sizing:      border-box
        padding-left:    space.$default-padding + 0.75px
        padding-right:   space.$default-padding + 0.75px
        line-height:     font.$line-height-14px
        text-align:      left
        font-size:       14px
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