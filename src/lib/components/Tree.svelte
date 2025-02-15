<script>
    import { createEventDispatcher } from 'svelte'
    import { messages, forks, active_fork, stars, tree_active } from '$lib/stores/chat.js'
    import { onMount, onDestroy } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { buildTree } from '$lib/utils/tree.js'
    import Header from '$lib/components/Tree/Header.svelte'
    import Sidebar from '$lib/components/Tree/Sidebar.svelte'
    import UsageStats from '$lib/components/Chat/UsageStats.svelte'

    const dispatch = createEventDispatcher()

    const leaf_spacing = 2 // # of columns

    let nodes,
        hovered_message

    $: nodes = buildTree($forks, $active_fork, $messages, $stars, leaf_spacing)

    const mouseenter = (node) => {
        hovered_message = node.message
    }

    const mouseleave = () => {
        hovered_message = null
    }

    const clicked = (node) => {
        $active_fork = $forks.findIndex(fork => fork.message_ids.includes(node.id))
        dispatch('goToMessage', { message_id: node.id })
        close()
    }

    const close = () => {
        $tree_active = false
    }

    const keydown = (e) => {
        if (e.key === 'Escape') return close()
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='tree' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <Header on:close={close} />

    {#if hovered_message}
        <Sidebar message={hovered_message} />
    {/if}

    <UsageStats/>

    <div class='inner'>
        <div class='chat-tree'>
            {#each nodes as node, i}
                {#if i === 0}
                    <button
                        class='system-prompt'
                        style='grid-area: 1 / {node.column}'
                        on:mouseenter={mouseenter(node)}
                        on:mouseleave={mouseleave(node)}
                    >
                        <div class='inner-content'>
                            System prompt
                            <div class='title'>
                                {node.message.system_prompt_title}
                            </div>
                        </div>
                    </button>
                {:else}
                    <button
                        class='node {node.message.role}'
                        class:active={node.is_active}
                        class:starred={node.is_starred}
                        style='grid-area: {node.row} / {node.column}'
                        on:click={clicked(node)}
                        on:mouseenter={mouseenter(node)}
                        on:mouseleave={mouseleave(node)}
                    >
                        {node.id}
                        {#if node.message.role === 'assistant'}
                            <img class='model-icon' src='/img/icons/models/{node.message.model.icon}' alt='{node.message.model.name}' />
                        {/if}
                    </button>
                {/if}
                {#if node.connector}
                    <div
                        class='connector {node.message.role}'
                        style='grid-row: {node.connector.grid_row}; grid-column: {node.connector.grid_column};'
                    >
                        {#if node.connector.child_positions.length === 1}
                            <div class='connector-simple-vertical'/>
                        {:else}
                            <div class='connector-horizontal'>
                                <div class='connector-parent' style='left: {node.connector.parent_position}'/>
                                <div class='connector-left'/>
                                <div class='connector-right'/>
                                {#each node.connector.child_positions.slice(1, -1) as position}
                                    <div class='connector-child' style='left: {position}'/>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style lang='sass'>
    $cell-height:                      33px
    $cell-width:                       44px
    $connector-color:                  $background-lighter
    $simple-vertical-connector-height: 16px
    $horizontal-nipple-height:         10px

    .tree
        position:         fixed
        top:              0
        left:             0
        z-index:          99
        width:            100vw
        height:           100vh
        box-sizing:       border-box
        padding-top:      space.$header-height
        background-color: color.adjust($background-darkest, $alpha: -0.025)

    .inner
        display:        flex
        flex-direction: column
        align-items:    center
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-top:    math.round(3 * space.$default-padding)
        padding-bottom: 128px
        overflow:       scroll
        +shared.scrollbar

    .chat-tree
        display:           grid
        grid-auto-rows:    $cell-height
        grid-auto-columns: $cell-width
        gap:               0
        user-select:       none

        .node
            display:          inline-flex
            align-items:      center
            justify-content:  center
            position:         relative
            z-index:          2
            height:           100%
            width:            100%
            border-radius:    6px
            background-color: transparent
            font-size:        14px
            font-weight:      600
            color:            $blue-grey
            cursor:           pointer
            transition:       transform easing.$quart-out 100ms, background-color easing.$quart-out 100ms, border-radius easing.$quart-out 100ms

            &.user
                top:           6px
                border-radius: 6px 6px 1px 1px

            &.assistant
                top:           -6px
                border-radius: 1px 1px 6px 6px

            &.active
                background-color: $background-lightest
                color:            $off-white

            &.starred
                color: $yellow

                &.active
                    background-color: $yellow
                    color:            $background-darkest

                &:hover
                    background-color: $off-white

            &:hover
                background-color: $off-white
                color:            $background-darkest
                transform:        scale(1.1)
                transition:       none
            
            &:active
                color:            $background-darkest
                background-color: color.adjust($off-white, $lightness: -2.5%)

            .model-icon
                position:      absolute
                bottom:        -4px
                right:         0
                transform:     translateX(50%)
                height:        21px
                border-radius: 4px
                box-shadow:    0 0 0 1px $background-darkest

        .connector
            display:         flex
            align-items:     center
            justify-content: center
            position:        relative
            z-index:         1
            box-sizing:      border-box
            padding:         0 (0.5 * $cell-width)
            height:          100%

            &.user
                .connector-simple-vertical
                    height: 0.5 * $simple-vertical-connector-height
                
                .connector-horizontal
                    .connector-parent,
                    .connector-left,
                    .connector-right,
                    .connector-child
                        height: 0.5 * $horizontal-nipple-height

            .connector-simple-vertical
                position:         absolute
                top:              50%
                left:             50%
                transform:        translate(-50%, -50%)
                width:            1px
                height:           $simple-vertical-connector-height
                background-color: $connector-color
            
            .connector-horizontal
                position:         relative
                width:            100%
                height:           1px
                background-color: $connector-color
            
            .connector-parent
                position:         absolute
                bottom:           0
                left:             50%
                transform:        translateX(-50%)
                width:            1px
                height:           $horizontal-nipple-height
                background-color: $connector-color

            .connector-left
                position:         absolute
                top:              0
                left:             0
                width:            1px
                height:           $horizontal-nipple-height
                background-color: $connector-color

            .connector-right
                position:         absolute
                top:              0
                right:            0
                width:            1px
                height:           $horizontal-nipple-height
                background-color: $connector-color

            .connector-child
                position:         absolute
                top:              0
                transform:        translateX(-50%)
                width:            1px
                height:           $horizontal-nipple-height
                background-color: $connector-color

        .system-prompt
            display:         flex
            align-items:     center
            justify-content: center
            position:        relative
            z-index:         2

            .inner-content
                display:          flex
                flex-direction:   column
                align-items:      center
                justify-content:  center
                position:         relative
                top:              -10px
                padding:          16px 24px
                border-radius:    8px
                border:           1px solid transparent
                background-color: transparent
                font-size:        14px
                color:            $blue-grey
                white-space:      nowrap
                line-height:      1.5
                transition:       background-color easing.$quart-out 100ms, border-color easing.$quart-out 100ms
                cursor:           pointer

                .title
                    font-size:   16px
                    font-weight: 600
                    color:       $off-white
                
                &:hover
                    border:           1px solid $background-lightest
                    background-color: $background-darkest
                    transition:       none
</style>
