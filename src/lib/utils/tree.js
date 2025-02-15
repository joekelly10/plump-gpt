export const buildTree = (forks, active_fork, messages, stars, leaf_spacing) => {
    let nodes = []

    class Node {
        constructor(id) {
            this.id       = id
            this.parent   = null
            this.children = []
            this.depth    = 0
            this.x        = 0
            this.row      = 0
            this.column   = 0
        }
    }

    //  Recursively build out the tree of nodes starting from
    //  the root node (id: 0 / system prompt)
    //
    //  NOTE: node.x is 0 indexed, but the css grid is 1 indexed
    //  so 1 is added to the x value when calculating grid column

    let root_node = new Node(0)

    forks.forEach(fork => {
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

    //  Decorate nodes and add to `nodes` array for rendering

    function process(node) {
        node.row    = node.depth * 2 + 1
        node.column = Math.round(node.x * leaf_spacing) + 1

        const message    = messages[node.id],
              is_active  = forks[active_fork].message_ids.slice(1).includes(node.id),
              is_starred = stars.includes(node.id)

        nodes.push({
            ...node,
            message,
            is_active,
            is_starred
        })

        node.children.forEach(child => process(child))
    }

    process(root_node)

    //  Add connectors to nodes with children (non-leaf nodes)
    //    - each connector is a rendering of the relationship
    //      between a given node and its children

    function addConnectors(node) {
        if (node.children.length > 0) {
            const parent_column = node.column,
                  child_columns = node.children.map(child => child.column),
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

    return nodes
}
