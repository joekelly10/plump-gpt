import { highlights } from '$lib/stores/chat'

const highlight_class = '_text-highlight'

export const createHighlight = (selection) => {
    console.log('🟡 Creating highlight...')

    try {
        const message_el = getRootMessageElement(selection)
        if (!message_el) return null

        const id         = 'hl-' + Date.now(),
              message_id = parseInt(message_el.dataset.message_id),
              range      = selection.getRangeAt(0),
              text       = selection.toString(),
              created_at = new Date().toISOString()

        const highlight = {
            id,
            message_id,
            start: {
                xpath:  getXPathForNode(range.startContainer, message_el),
                offset: range.startOffset
            },
            end: {
                xpath:  getXPathForNode(range.endContainer, message_el),
                offset: range.endOffset
            },
            text,
            created_at
        }

        highlights.update(highlights => [...highlights, highlight])
        console.log(`🟡–✅ Created highlight:\n#message-${highlight.message_id}\n"${highlight.text}"`)

        return highlight
    } catch (error) {
        console.warn('🟡–❌ Could not create highlight', error)
        return null
    }
}

export const deleteHighlight = (highlight_id) => {
    highlights.update(highlights => highlights.filter(highlight => highlight.id !== highlight_id))
    console.log(`🟡–🗑️ Deleted highlight: ${highlight_id}`)
}

export const renderHighlights = (highlights) => {
    if (typeof document === 'undefined') return

    removeAllHighlights()

    if (highlights.length === 0) return

    console.log(`🟨 Adding highlight spans...`)

    let count = 0

    highlights.forEach((highlight, index) => {
        const message_el = document.getElementById(`message-${highlight.message_id}`)

        if (!message_el) {
            console.log(`🟨 ⏭ Skipping ${index + 1}/${highlights.length} (#message-${highlight.message_id} not found)`)
            return null
        }

        const start_node = getNodeByXPath(highlight.start.xpath, message_el),
              end_node   = getNodeByXPath(highlight.end.xpath, message_el)

        try {
            if (!start_node || !end_node || start_node.textContent.trim().length === 0 || end_node.textContent.trim().length === 0) {
                return null
            }
    
            const addSpanAround = (range) => {
                if (range.toString().trim().length === 0) return null
                const span = document.createElement('SPAN')
                span.className            = highlight_class
                span.dataset.highlight_id = highlight.id
                range.surroundContents(span)
                return span
            }

            if (start_node === end_node) {
                const range = document.createRange()
                range.setStart(start_node, highlight.start.offset)
                range.setEnd(end_node, highlight.end.offset)
                addSpanAround(range)
            } else {
                // need to get nodes between before adding spans to start and end nodes
                const nodes_between = getTextNodesBetween(start_node, end_node, message_el)

                const start_range = document.createRange()
                start_range.selectNodeContents(start_node)
                start_range.setStart(start_node, highlight.start.offset)
                addSpanAround(start_range)

                nodes_between.forEach(node => {
                    const range = document.createRange()
                    range.selectNodeContents(node)
                    addSpanAround(range)
                })

                const end_range = document.createRange()
                end_range.selectNode(end_node)
                end_range.setEnd(end_node, highlight.end.offset)
                addSpanAround(end_range)
            }

            console.log(`🟨 #message-${highlight.message_id}\n"${highlight.text}"`)
            count++
        } catch (error) {
            console.warn('🟨–❌ Failed to render highlight', error, highlight, start_node, end_node)
        }
    })

    console.log(`🟨-✅ Rendered ${count}/${highlights.length} highlight${count === 1 ? '' : 's'}.`)
}

const getRootMessageElement = (selection) => {
    const anchor_message_el = findAncestor(selection.anchorNode, '.message'),
          focus_message_el  = findAncestor(selection.focusNode, '.message')

    if (anchor_message_el === focus_message_el) {
        return anchor_message_el
    } else {
        console.warn('🟡–❌ Selection must start and end in the same message!')
        return null
    }
}

const findAncestor = (node, selector) => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.parentNode.closest(selector)
    }
    return node.closest(selector)
}

const getXPathForNode = (node, root) => {
    if (!node.parentNode) return null

    let xpath   = '',
        current = node

    while (current && current !== root) {
        if (current.nodeType === Node.TEXT_NODE) {
            const siblings      = Array.from(current.parentNode.childNodes),
                  text_siblings = siblings.filter(node => node.nodeType === Node.TEXT_NODE),
                  index         = text_siblings.indexOf(current) + 1
            xpath = `/text()[${index}]${xpath}`
        } else {
            const all_siblings     = Array.from(current.parentNode.children),
                  siblings_of_type = all_siblings.filter(child => child.tagName === current.tagName),
                  index            = siblings_of_type.indexOf(current) + 1
            xpath   = `/${current.tagName.toLowerCase()}[${index}]${xpath}`
        }
        current = current.parentNode
    }

    xpath = `.${xpath}`

    return xpath
}

const getNodeByXPath = (xpath, root) => {
    try {
        return document.evaluate(xpath, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    } catch (error) {
        console.warn('🟡–❌ XPath evaluation failed', error)
        return null
    }
}

const getTextNodesBetween = (start_node, end_node, root_node) => {
    const iterator      = document.createNodeIterator(root_node, NodeFilter.SHOW_TEXT),
          nodes_between = []

    let node        = iterator.nextNode(),
        should_take = false

    while (node !== end_node) {
        if (should_take && node?.textContent?.trim().length > 0) {
            nodes_between.push(node)
        }
        if (node === start_node) should_take = true
        node = iterator.nextNode()
    }

    return nodes_between
}

export const removeAllHighlights = () => {
    if (typeof document === 'undefined') return

    const spans = document.querySelectorAll(`.${highlight_class}`)

    spans.forEach(span => {
        const message_el = span.closest('.message')
        if (message_el) {
            unwrapText(span)
            message_el.normalize()
        }
    })
}

const unwrapText = (span) => {
    const parent      = span.parentNode,
          child_nodes = span.childNodes

    child_nodes.forEach(node => {
        parent.insertBefore(node, span)
    })

    parent.removeChild(span)
}
