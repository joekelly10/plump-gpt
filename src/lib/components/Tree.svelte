<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tree_active } from '$lib/stores/app.js'
    import { messages, forks, active_fork, stars, highlights } from '$lib/stores/chat'
    import { buildTree } from '$lib/utils/tree.js'
    import { smoothScroll } from '$lib/utils/helpers.js'

    import Header from '$lib/components/Tree/Header.svelte'
    import Sidebar from '$lib/components/Tree/Sidebar.svelte'
    import UsageStats from '$lib/components/Chat/UsageStats.svelte'

    const dispatch = createEventDispatcher()

    let nodes,
        hovered_node,
        debounce_timer,
        pending_node,
        container_el
    
    const leaf_spacing = 2 // # of columns

    $: nodes = buildTree($forks, $active_fork, $messages, $stars, $highlights, leaf_spacing)

    onMount(() => {
        document.addEventListener('keydown', keydown)
        if ($messages.length > 1) scrollToActiveNode()
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })

    const scrollToActiveNode = () => {
        const active_node    = nodes.find(node => node.is_active && node.children.length === 0),
              active_node_el = container_el?.querySelector(`[data-node-id="${active_node.id}"]`)
        if (active_node_el) {
            const node_bottom = active_node_el.offsetTop + active_node_el.offsetHeight,
                  threshold   = 100
            if (node_bottom > container_el.clientHeight - threshold) {
                const target_scroll_position = node_bottom - container_el.clientHeight / 2
                setTimeout(() => {
                    smoothScroll(container_el, target_scroll_position, 1000, 'quartOut')
                }, 200)
            }
        }
    }

    const mouseenter = (node) => {
        if (debounce_timer) {
            pending_node = node
        } else {
            hovered_node = pending_node ? pending_node : node
        }
        clearTimeout(debounce_timer)
        debounce_timer  = setTimeout(() => {
            debounce_timer = null
            if (pending_node) {
                hovered_node = pending_node
                pending_node = null
            }
        }, 150)
    }

    const mouseleave = () => {
        hovered_node = null
        pending_node = null
    }

    const clicked = (node) => {
        if (!$forks[$active_fork].message_ids.includes(node.id)) {
            $active_fork = $forks.findIndex(fork => fork.message_ids.includes(node.id))
        }
        dispatch('goToMessage', { message_id: node.id })
        close()
    }

    const close = () => {
        $tree_active = false
    }

    const keydown = (e) => {
        if (e.key === 'Escape') return close()
    }
</script>

<div class='tree' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <Header on:close={close} />

    {#if hovered_node}
        <Sidebar node={hovered_node} />
    {/if}

    <UsageStats tree_view={true} />

    <div class='inner' bind:this={container_el}>
        <div class='chat-tree'>
            {#each nodes as node, i}
                {#if i === 0}
                    <button
                        class='system-prompt'
                        style='grid-area: 1 / {node.column}'
                        on:mouseenter={() => mouseenter(node)}
                        on:mouseleave={mouseleave}
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
                        data-node-id={node.id}
                        class='node {node.message.role}'
                        class:active={node.is_active}
                        class:starred={node.is_starred}
                        class:highlighted={node.highlights.length > 0}
                        style='grid-area: {node.row} / {node.column}'
                        on:click={() => clicked(node)}
                        on:mouseenter={() => mouseenter(node)}
                        on:mouseleave={mouseleave}
                    >
                        {node.id}
                        {#if node.message.role === 'assistant'}
                            <img class='model-icon' src='/img/icons/models/{node.message.model.icon}' alt='{node.message.model.name}' />
                        {/if}
                    </button>
                    {#if node.is_active && node.children.length === 0}
                        <div class='you-are-here' style='grid-area: {node.row + 1} / {node.column}'>
                            <div class='line1'>YOU ARE</div>
                            <div class='line2'>HERE</div>
                        </div>
                    {/if}
                {/if}
                {#if node.connector}
                    <div
                        class='connector {node.message.role}'
                        style='grid-row: {node.connector.grid_row}; grid-column: {node.connector.grid_column};'
                    >
                        {#if node.connector.child_positions.length === 1}
                            <div class='connector-simple-vertical'></div>
                        {:else}
                            <div class='connector-horizontal'>
                                <div class='connector-parent' style='left: {node.connector.parent_position}'></div>
                                <div class='connector-left'></div>
                                <div class='connector-right'></div>
                                {#each node.connector.child_positions.slice(1, -1) as position}
                                    <div class='connector-child' style='left: {position}'></div>
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
    $connector-color:                  $background-300
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
        background-color: color.adjust($background-800, $alpha: -0.025)

    .inner
        display:        flex
        flex-direction: column
        align-items:    center
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-top:    120px
        padding-bottom: 50vh
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
            background-color: color.adjust($blue-grey, $alpha: -0.966)
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
                background-color: $background-200
                color:            $off-white

            &.starred,
            &.highlighted
                background-color: color.adjust($yellow, $alpha: -0.9)
                color:            $yellow

                &.active
                    background-color: $yellow
                    color:            $background-800

                &:hover
                    background-color: $off-white

            &:hover
                background-color: $off-white
                color:            $background-800
                transform:        scale(1.1)
                transition:       none
            
            &:active
                color:            $background-800
                background-color: color.adjust($off-white, $lightness: -2.5%)

            .model-icon
                position:      absolute
                bottom:        -4px
                right:         0
                transform:     translateX(50%)
                height:        21px
                border-radius: 4px
                box-shadow:    0 0 0 1px $background-800

        .you-are-here
            position:       relative
            top:            38px
            font-size:      18px
            font-weight:    600
            color:          $off-white
            text-align:     center
            pointer-events: none

            &:before
                content:       ''
                position:      absolute
                top:           -15px
                left:          50%
                transform:     translateX(-50%)
                width:         0
                height:        0
                border-left:   5px solid transparent
                border-right:  5px solid transparent
                border-bottom: 5px solid $off-white

            .line1
                font-size:   10px
                line-height: 12px
                font-weight: 700
                white-space: nowrap

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
                top:              -30px
                padding:          16px 24px
                border-radius:    8px
                border:           1px solid transparent
                background-color: color.adjust($blue-grey, $alpha: -0.966)
                font-size:        14px
                font-weight:      450
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
                    background-color: color.adjust($blue-grey, $alpha: -0.933)
                    transition:       none
                
                &:active
                    background-color: color.adjust($blue-grey, $alpha: -0.936)
</style>
