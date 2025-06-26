<script>
    import { tick } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tree_active, loader_active, prompt_editor_active } from '$lib/stores/app'
    import { messages, forks, active_fork, active_messages, fork_points, highlights, usage } from '$lib/stores/chat'
    import { is_provisionally_forking, is_scrolled_to_bottom } from '$lib/stores/chat/interactions'
    import { model } from '$lib/stores/ai'
    import { is_sending } from '$lib/stores/api'
    import { smoothScroll } from '$lib/utils/helpers'
    import { createHighlight, renderHighlights } from '$lib/utils/highlighter'

    import UsageStats from '$lib/components/Chat/UsageStats.svelte'
    import Message from '$lib/components/Chat/Message.svelte'
    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'
    import HighlightAction from '$lib/components/Chat/HighlightAction.svelte'

    export const scrollToBottom         = (options) => _scrollToBottom(options),
                 goToMessage            = (options) => _goToMessage(options),
                 renderActiveHighlights = () => _renderActiveHighlights(),
                 cancelFork             = () => _cancelFork()

    let {
        // actions
        saveChat,
        deleteChat,
        addReply,
        regenerateReply,
        quoteSelectedText,

        // events
        onChatUpdated
    } = $props()
    
    let chat,
        uparrow_limiter,
        downarrow_limiter

    let message_refs                 = $state([]), // references to the list of `Message` components
        forking_from                 = $state(null),
        scroll_interrupted           = $state(false),
        scroll_reasoning_interrupted = $state(false),
        scroll_reasoning_pending_id  = $state(null), // flag to trigger scrolling of reasoning content
        highlight_action_visible     = $state(false),
        highlight_action_position    = $state({ x: 0, y: 0 })

    $effect(() => { $highlights; whenHighlightsChange() })

    const whenHighlightsChange = () => {
        renderActiveHighlights()
    }

    const _scrollToBottom = (options = { context: null }) => {
        const bottom   = chat.scrollHeight - chat.clientHeight,
              distance = bottom - chat.scrollTop

        if (options.context === 'sending_message') {
            scroll_interrupted           = false
            scroll_reasoning_interrupted = false
            if (distance < 2500) {
                smoothScroll(chat, bottom, 500, 'quartOut')
            } else if (distance < 5000) {
                smoothScroll(chat, bottom, 750, 'quartOut')
            } else if (distance < 7500) {
                smoothScroll(chat, bottom, 1000, 'quartOut')
            } else {
                smoothScroll(chat, bottom, 1250, 'quartOut')
            }
        } else if (['streaming_started', 'streaming_message', 'streaming_finished'].includes(options.context)) {
            if (!scroll_interrupted) {
                if (distance < 300) {
                    smoothScroll(chat, bottom, 250, 'quartOut')
                } else {
                    smoothScroll(chat, bottom, 500, 'quartOut')
                }
            }
            if ($model.is_reasoner && !scroll_reasoning_interrupted) {
                const id_of_last = $active_messages[$active_messages.length - 1].id
                scroll_reasoning_pending_id = id_of_last
            }
        } else if (['scroll_down_button', 'keyboard_shortcut', 'chat_loaded', 'new_fork'].includes(options.context)) {
            scroll_interrupted           = false
            scroll_reasoning_interrupted = false
            if (distance < 1000) {
                smoothScroll(chat, bottom, 333, 'quartOut')
            } else if (distance < 2500) {
                smoothScroll(chat, bottom, 500, 'quartOut')
            } else if (distance < 5000) {
                smoothScroll(chat, bottom, 750, 'quartOut')
            } else if (distance < 7500) {
                smoothScroll(chat, bottom, 1000, 'quartOut')
            } else {
                smoothScroll(chat, bottom, 1250, 'quartOut')
            }
        }
    }

    const _goToMessage = (options = { message_id: null, delay: 0 }) => {
        if (!$forks[$active_fork].message_ids.includes(options.message_id)) {
            $active_fork = $forks.findIndex(fork => fork.message_ids.includes(options.message_id))
        }
        setTimeout(() => {
            const message     = message_refs[options.message_id],
                  message_top = message?.getOffsetTop(),
                  offset      = -40
            chat.scroll({ top: message_top + offset, behavior: 'smooth' })
            message?.tempHighlight()
            renderActiveHighlights()
        }, options.delay)
    }

    const _renderActiveHighlights = () => {
        //
        //  HACK: prevents rendering highlights twice when loading chat.
        //  first time is when $highlights is set on load but chat html
        //  isn't rendered yet
        //
        const is_before_chat_has_loaded = $loader_active || $tree_active
        if (is_before_chat_has_loaded) return
        
        const active_highlights = $highlights.filter(highlight => {
            return $active_messages.some(message => message.id === highlight.message_id)
        })

        renderHighlights(active_highlights)
    }

    const _cancelFork = () => {
        if (!$is_provisionally_forking) return
        switchToFork(forking_from)
    }

    const onkeydown = (e) => {
        if ($loader_active || $prompt_editor_active) return

        if (e.shiftKey && e.altKey && e.key === 'ArrowDown') {
            return scrollToBottom({ context: 'keyboard_shortcut' })
        }
        if (e.shiftKey && e.altKey && e.key === 'ArrowUp') {
            return scrollToTop()
        }
        if (e.altKey && e.key === 'ArrowDown') {
            if (downarrow_limiter) return
            downarrow_limiter = setTimeout(() => { downarrow_limiter = null }, 50)
            return smoothScroll(chat, chat.scrollTop + 400, 333, 'quartOut')
        }
        if (e.altKey && e.key === 'ArrowUp') {
            if (uparrow_limiter) return
            uparrow_limiter = setTimeout(() => { uparrow_limiter = null }, 50)
            return smoothScroll(chat, chat.scrollTop - 400, 333, 'quartOut')
        }
        if (e.ctrlKey && e.key === 'Backspace') {
            return deleteMessage($messages.length-1)
        }
        if (e.ctrlKey && e.key === 'r') {
            return regenerateReply()
        }
        if (e.key === 'Escape') {
            if ($forks[$active_fork].provisional) cancelFork()
            deselectText()
            return
        }
    }

    const scrollToTop = () => {
        scroll_interrupted = true
        const distance = chat.scrollHeight - chat.clientHeight
        if (distance < 1000) {
            return smoothScroll(chat, 0, 333, 'quartOut')
        } else if (distance < 2500) {
            return smoothScroll(chat, 0, 500, 'quartOut')
        } else if (distance < 5000) {
            return smoothScroll(chat, 0, 750, 'quartOut')
        } else if (distance < 7500) {
            return smoothScroll(chat, 0, 1000, 'quartOut')
        } else {
            return smoothScroll(chat, 0, 1250, 'quartOut')
        }
    }

    const switchToFork = async (fork_index) => {
        $active_fork = fork_index
        if (forking_from !== null) {
            forking_from              = null
            $is_provisionally_forking = false
            removeProvisionalFork()
        }
        onChatUpdated()
        await tick()
        renderActiveHighlights()
    }

    const removeProvisionalFork = () => {
        for (let i = 0; i < $forks.length; i++) {
            if ($forks[i].provisional) {
                const forked_at = $forks[i].forked_at[$forks[i].forked_at.length - 1]

                //  Remove the fork point from the other fork if there's only
                //  one other fork left after removing the provisional one

                let other_forks = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (i === _i) continue
                    if ($forks[_i].forked_at.includes(forked_at)) other_forks.push(_i)
                }
                if (other_forks.length === 1) {
                    const index = other_forks[0]
                    $forks[index].forked_at = $forks[index].forked_at.filter(id => id !== forked_at)
                }

                $forks.splice(i,1)

                //  if the provisional fork was not at the end of the array when
                //  removed, which can happen when deleting messages on an
                //  old fork, `active_fork` may go out of range:

                if ($active_fork > $forks.length - 1) $active_fork -= 1
            }
        }
        $forks = $forks
    }

    const onwheel = (e) => {
        //  UX here = the two scroll interuptions work independently
        //  (i.e. for the main chat and the reasoning content div)
        //  based on where the mouse is when the wheel event occurs
        const scrolled_up  = e.deltaY < 0,
              on_reasoning = e.target.closest('.reasoning-content')
        if (scrolled_up) {
            if (on_reasoning) {
                scroll_reasoning_interrupted = true
            } else {
                scroll_interrupted = true
            }
        } else {
            if (on_reasoning) {
                //  handled in Message.svelte
            } else {
                const threshold = 160,
                      bottom    = chat.scrollHeight - chat.clientHeight
                if (chat.scrollTop >= bottom - threshold) {
                    scroll_interrupted = false
                }
            }
        }
    }

    const onscroll = () => {
        const bottom = chat.scrollHeight - chat.clientHeight
        $is_scrolled_to_bottom = chat.scrollTop >= bottom - 160

        if (highlight_action_visible) {
            const selection = window.getSelection()
            if (selection && !selection.isCollapsed) {
                positionHighlightAction(selection)
            }
        }
    }

    const onmouseup = async (e) => {
        if (e.target.closest('.highlight-action')) return
        //  Known issue: when de-selecting text, the selection isn't
        //  updated before mouseup, so we need to wait a tick
        await new Promise(resolve => setTimeout(resolve, 1))

        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) {
            const messages_div   = document.querySelector('.chat > .messages'),
                  is_in_messages = messages_div.contains(selection.anchorNode) && messages_div.contains(selection.focusNode)
            if (is_in_messages) {
                positionHighlightAction(selection)
                highlight_action_visible = true
            } else {
                highlight_action_visible = false
            }
        } else {
            highlight_action_visible = false
        }
    }

    const onmousedown = (e) => {
        if (e.target.closest('.highlight-action')) return
        highlight_action_visible = false
    }

    const onselectionchange = () => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed) {
            highlight_action_visible = false
        }
    }

    const positionHighlightAction = (selection) => {
        if (isForwardSelection(selection)) {
            const range      = selection.getRangeAt(0),
                  all_rects  = range.getClientRects(),
                  last_rect  = all_rects[all_rects.length - 1]
            highlight_action_position = {
                x: last_rect.right,
                y: last_rect.top - 20
            }
        } else {
            const range      = selection.getRangeAt(0),
                  all_rects  = range.getClientRects(),
                  first_rect = all_rects[0]
            highlight_action_position = {
                x: first_rect.left,
                y: first_rect.top - 20
            }
        }
    }

    const isForwardSelection = (selection) => {
        if (selection.anchorNode === selection.focusNode) {
            return selection.anchorOffset <= selection.focusOffset
        }
        const node_relationship = selection.anchorNode.compareDocumentPosition(selection.focusNode)
        return node_relationship & Node.DOCUMENT_POSITION_FOLLOWING
    }
    
    const clickedQuoteButton = () => {
        quoteSelectedText()
        highlight_action_visible = false
    }

    const clickedHighlightButton = async () => {
        const selection = window.getSelection()

        if (!selection || selection.isCollapsed) {
            highlight_action_visible = false
            return
        }

        const highlight = createHighlight(selection)

        if (highlight) {
            deselectText()
            saveChat()
        }
    }

    const deselectText = () => {
        const selection = window.getSelection()
        if (selection) selection.removeAllRanges()
        highlight_action_visible = false
    }
</script>

<svelte:document onkeydown={onkeydown} onmousedown={onmousedown} onselectionchange={onselectionchange} />

<section
    class='chat'
    class:frozen={$loader_active || $prompt_editor_active}
    bind:this={chat}
    onwheel={onwheel}
    onscroll={onscroll}
    onmouseup={onmouseup}
>
    {#if $usage.total_responses > 0}
        <UsageStats/>
    {/if}

    <div class='messages'>
        {#each $active_messages.slice(1) as message (`${$active_fork}-${message.id}`)}
            <Message
                bind:this={message_refs[message.id]}
                bind:forking_from
                bind:scroll_reasoning_interrupted
                bind:scroll_reasoning_pending_id
                message={message}
                scrollToBottom={scrollToBottom}
                addReply={addReply}
                regenerateReply={regenerateReply}
                removeProvisionalFork={removeProvisionalFork}
                switchToFork={switchToFork}
                cancelFork={cancelFork}
                saveChat={saveChat}
                deleteChat={deleteChat}
                onChatUpdated={onChatUpdated}
            />
        {/each}
        {#if $is_sending}
            <div class='connecting' in:fly={{ y: -16, delay: 2500, duration: 125, easing: quartOut }}>
                <img class='model-icon' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
                <span class='text'>
                    Waiting for {$model.hosted_at}<WaitingDots/>
                </span>
            </div>
        {/if}
    </div>
    
    {#if highlight_action_visible}
        <HighlightAction
            bind:highlight_action_position
            onClickQuoteButton={clickedQuoteButton}
            onClickHighlightButton={clickedHighlightButton}
        />
    {/if}
</section>

<style lang='sass'>
    .chat
        flex-grow:  1
        position:   relative
        overflow-y: overlay
        +shared.scrollbar
        scrollbar-gutter: stable
        padding-left:     8px

        &.frozen
            overflow: hidden
        
    .messages
        margin:         0 auto
        width:          space.$main-column-width
        padding-bottom: 84px

    .connecting
        display:         flex
        align-items:     center
        justify-content: center
        gap:             16px
        margin-top:      space.$default-padding
        font-size:       14px
        font-weight:     450
        color:           $blue-grey
        user-select:     none
        animation:       pulse 2s linear infinite

        .model-icon
            height: 21px
    
    @keyframes pulse
        0%
            opacity: 0.8
        20%
            opacity: 0.8
        60%
            opacity: 1
        90%
            opacity: 1
        100%
            opacity: 0.8
</style>
