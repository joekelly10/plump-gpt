<script>
    import { createEventDispatcher } from 'svelte'
    import { messages, forks, active_fork, stars, tree_active } from '$lib/stores/chat.js'
    import { onMount, onDestroy } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import UsageStats from '$lib/components/Chat/UsageStats.svelte'

    const dispatch = createEventDispatcher()

    onMount(() => {
        buildTree()
        document.addEventListener('keydown', keydown)
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })

    $: {
        $active_fork
        buildTree()
    }

    //  NOTE: node.x is 0 indexed, but the css grid is 1 indexed
    //  so 1 is added to the x value when calculating grid columns

    class Node {
        constructor(id) {
            this.id       = id
            this.parent   = null
            this.children = []
            this.depth    = 0
            this.x        = 0
        }
    }

    const leaf_spacing = 2 // # of columns

    //  Recursively build out the tree of nodes starting from
    //  the root node (id: 0 / system prompt)

    let nodes = []

    function buildTree() {
        let root_node = new Node(0)

        $forks.forEach(fork => {
            let current_node = root_node

            for (let i = 1; i < fork.message_ids.length; i++) {
                const id = fork.message_ids[i]
                let child = current_node.children.find(c => c.id === id)
                if (!child) {
                    child        = new Node(id)
                    child.parent = current_node
                    child.depth  = current_node.depth + 1
                    current_node.children.push(child)
                }
                current_node = child
            }
        })

        //  Traverse the tree and assign x values to each node
        //    - each leaf node has an integer value
        //    - non-leaf / "internal" nodes get a mid-point value, which
        //      can be a decimal (rounded during grid placement)

        let leaf_counter = 0

        function assignX(node) {
            if (node.children.length === 0) {
                node.x = leaf_counter
                leaf_counter++
            } else {
                node.children.forEach(child => assignX(child))
                const first_child = node.children[0],
                      last_child  = node.children[node.children.length - 1]
                node.x = (first_child.x + last_child.x) / 2
            }
        }

        assignX(root_node)

        nodes = []

        //  Decorate nodes and add to `nodes` array for rendering

        function process(node) {
            const message    = $messages[node.id],
                  is_active  = $forks[$active_fork].message_ids.slice(1).includes(node.id),
                  is_starred = $stars.includes(node.id),
                  role       = message.role

            nodes.push({
                ...node,
                message,
                is_active,
                is_starred,
                role
            })

            node.children.forEach(child => process(child))
        }

        process(root_node)

        //  Add connectors to nodes with children (non-leaf nodes)
        //    - each connector is a rendering of the relationship
        //      between a given node and its children

        function addConnectors(node) {
            if (node.children.length > 0) {
                const parent_column = Math.round(node.x * leaf_spacing) + 1,
                      child_columns = node.children.map(child => Math.round(child.x * leaf_spacing) + 1),
                      start         = Math.min(...child_columns),
                      end           = Math.max(...child_columns)
                
                const css_grid_row = node.depth * 2 + 2

                let css_grid_column,
                    css_parent_position,
                    css_child_positions

                if (child_columns.length === 1) {
                    //  simple vertical line
                    css_grid_column     = parent_column
                    css_parent_position = '50%'
                    css_child_positions = ['50%']
                } else {
                    //  horizontal line with one upward nipple to parent
                    //  and multiple downward nipples to children
                    //  TODO: add trigger warning for people with sensitive nipples
                    css_grid_column     = `${start} / ${end + 1}`
                    css_parent_position = `${((parent_column - start) / (end - start)) * 100}%`
                    css_child_positions = child_columns.map(column => `${((column - start) / (end - start)) * 100}%`)
                }
                
                node.connector = {
                    grid_row:        css_grid_row,
                    grid_column:     css_grid_column,
                    parent_position: css_parent_position,
                    child_positions: css_child_positions
                }
            }
        }

        nodes.forEach(node => addConnectors(node))
    }

    const clickedNode = (node) => {
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
</script>

<div class='tree' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div class='header'>
        <div class='title'>
            Tree View
            <!-- Plump GPTree -->
            <!-- Overview -->
            <span class='bull'>
                //
            </span>
            <span class='fork-text'>
                Fork {$active_fork + 1} / {$forks.length}
            </span>
        </div>
        <button class='close-button' on:click={close}>
            <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
        </button>
    </div>

    <UsageStats/>

    <div class='inner'>
        <div class='chat-tree'>
            {#each nodes as node, i}
                {#if i === 0}
                    <button
                        class='system-prompt'
                        style='grid-row: 1; grid-column: {Math.round(node.x * leaf_spacing) + 1};'
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
                        class='node {node.role}'
                        class:active={node.is_active}
                        class:starred={node.is_starred}
                        style='grid-row: {node.depth * 2 + 1}; grid-column: {Math.round(node.x * leaf_spacing) + 1};'
                        on:click={clickedNode(node)}
                    >
                        {node.id}
                        {#if node.message.role === 'assistant'}
                            <img class='model-icon' src='/img/icons/models/{node.message.model.icon}' alt='{node.message.model.name}' />
                        {/if}
                    </button>
                {/if}
                {#if node.connector}
                    <div
                        class='connector {node.role}'
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

    .header
        display:          flex
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        z-index:          100
        width:            100%
        height:           space.$header-height
        background-color: color.adjust($background-darkest, $lightness: -2%)

        .title
            font-size:      17.5px
            font-weight:    900
            text-transform: uppercase
            line-height:    25px

            .bull
                margin:         0 10px
                font-weight:    900
                letter-spacing: 0.5px
                color:          $blue

            .fork-text
                font-size:      14px
                font-weight:    500
                color:          $blue-grey
                text-transform: none
    
        .close-button
            display:         flex
            align-items:     center
            justify-content: center
            position:        fixed
            top:             0
            right:           0
            z-index:         101
            height:          space.$header-height
            padding:         0 space.$default-padding
            cursor:          pointer

            .close-icon
                height: 16px
            
            &:hover
                .close-icon
                    filter: brightness(0.8)
    .inner
        display:        flex
        flex-direction: column
        align-items:    center
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-top:    round(2.5 * space.$default-padding)
        padding-bottom: 128px
        overflow:       scroll
        +shared.scrollbar

    .chat-tree
        display:           grid
        grid-auto-rows:    $cell-height
        grid-auto-columns: $cell-width
        gap:               0
        user-select:       none

        .system-prompt
            display:         flex
            align-items:     center
            justify-content: center
            position:        relative
            z-index:         2

            .inner-content
                display:         flex
                flex-direction:  column
                align-items:     center
                justify-content: center
                position:        relative
                top:             -6px
                padding:         14px space.$default-padding
                border-radius:   8px
                font-size:       14px
                color:           $blue-grey
                white-space:     nowrap
                line-height:     1.5
                transition:      transform easing.$quart-out 100ms, background-color easing.$quart-out 100ms

                .title
                    font-size:   16px
                    font-weight: 600
                    color:       $off-white

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
</style>
