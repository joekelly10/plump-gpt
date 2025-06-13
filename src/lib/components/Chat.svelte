<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tree_active, loader_active, prompt_editor_active } from '$lib/stores/app'
    import { messages, forks, active_fork, active_messages, fork_points, stars, highlights, usage } from '$lib/stores/chat'
    import { is_deleting, is_adding_reply, is_provisionally_forking, is_scrolled_to_bottom } from '$lib/stores/chat/interactions'
    import { model } from '$lib/stores/ai'
    import { is_idle, is_sending } from '$lib/stores/api'
    import { insert, smoothScroll } from '$lib/utils/helpers'
    import { createHighlight, renderHighlights } from '$lib/utils/highlighter'

    import UsageStats from '$lib/components/Chat/UsageStats.svelte'
    import Message from '$lib/components/Chat/Message.svelte'
    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'
    import HighlightAction from '$lib/components/Chat/HighlightAction.svelte'

    const dispatch = createEventDispatcher()
    
    let chat,
        forking_from,
        uparrow_limiter,
        downarrow_limiter

    let message_refs                 = [], // references to the list of `Message` components
        scroll_interrupted           = false,
        scroll_reasoning_interrupted = false,
        highlight_action_visible     = false,
        highlight_action_position    = { x: 0, y: 0 }

    $: processed_messages = $active_messages.slice(1).map((message, i) => ({
        ...message,
        is_last:      i === $active_messages.slice(1).length - 1,
        forks:        getForksAt(message),
        has_siblings: hasSiblings(message)
    }))

    $: {
        $highlights
        renderActiveHighlights()
    }

    export const sendingMessage = () => $is_provisionally_forking = false

    export const scrollToBottom = (options = { context: null }) => {
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
            if (!scroll_reasoning_interrupted) {
                const id_of_last = $active_messages[$active_messages.length - 1].id
                message_refs[id_of_last]?.scrollReasoningToBottom()
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

    export const goToMessage = (options = { message_id: null, delay: 0 }) => {
        if (!$forks[$active_fork].message_ids.includes(options.message_id)) {
            $active_fork = $forks.findIndex(fork => fork.message_ids.includes(options.message_id))
        }
        setTimeout(() => {
            const element     = message_refs[options.message_id],
                  element_top = element?.getOffsetTop(),
                  offset      = -40
            chat.scroll({ top: element_top + offset, behavior: 'smooth' })
            element.tempHighlight()
            renderActiveHighlights()
        }, options.delay)
    }

    export const renderActiveHighlights = () => {
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

    export const cancelProvisionalFork = () => switchToFork(forking_from)

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

    const keydown = (e) => {
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
            if ($forks[$active_fork].provisional) cancelProvisionalFork()
            deselectText()
            return
        }
    }

    const regenerateReply = async () => {
        if (confirm(`Regenerate this reply?  Press OK to confirm.`)) {
            $is_deleting = true
            await tick()

            const deleted = $forks[$active_fork].message_ids.splice(-1,1)
            $messages   = $messages.filter(m => m.id !== deleted[0])
            $stars      = $stars.filter(m => m.id !== deleted[0])
            $highlights = $highlights.filter(hl => hl.message_id !== deleted[0])
            dispatch('regenerateReply')

            await tick()
            $is_deleting = false
        }
    }

    const deleteMessage = async (delete_both = false) => {
        if (confirm(`Delete this message?  Press OK to confirm.`)) {
            $is_deleting = true
            await tick()

            let deleted
            if (delete_both) {
                deleted = $forks[$active_fork].message_ids.splice(-2,2)
            } else {
                deleted = $forks[$active_fork].message_ids.splice(-1,1)
            }

            $messages   = $messages.filter(m => !deleted.includes(m.id))
            $stars      = $stars.filter(id => !deleted.includes(id))
            $highlights = $highlights.filter(hl => !deleted.includes(hl.message_id))
            updateForksAfterDelete()
            dispatch('chatModified') 
            dispatch('save')

            await tick()
            $is_deleting = false
        }
    }

    const addReply = async (message_id) => {
        $is_adding_reply = true
        if ($is_provisionally_forking) {
            forking_from              = null
            $is_provisionally_forking = false
            removeProvisionalFork()
        }
        insert(message_id, $forks[$active_fork].forked_at)
        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message_id)
        const message_ids = $forks[$active_fork].message_ids.filter(id => id <= message_id)
        $forks       = $forks.concat([{ message_ids, forked_at, provisional: false }])
        $active_fork = $forks.length - 1
        dispatch('chatModified')
        dispatch('addReply')
    }

    const forkFrom = async (message_id) => {
        if (!$is_idle) return
        forking_from              = $active_fork
        $is_provisionally_forking = true
        insert(message_id, $forks[$active_fork].forked_at)
        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message_id)
        const message_ids = $forks[$active_fork].message_ids.filter(id => id <= message_id)
        $forks       = $forks.concat([{ message_ids, forked_at, provisional: true }])
        $active_fork = $forks.length - 1
        dispatch('chatModified')
        setTimeout(() => { scrollToBottom({ context: 'new_fork' }) }, 100)
    }

    const getForksAt = (message) => {
        let all_forks = []

        const fork_pts = $fork_points.filter(pair => pair[0] === message.id)

        fork_pts.forEach(fp => {
            const index           = firstIndexOf(fp),
                  active_ids      = $forks[$active_fork].message_ids,
                  message_index   = active_ids.indexOf(message.id),
                  is_active       = fp[1] === active_ids[message_index + 1],
                  provisional     = $forks[index]?.provisional,
                  message_ids     = $forks[index]?.message_ids ?? [],
                  next_message_id = message_ids[message_ids.findIndex(id => id === message.id) + 1] ?? null,
                  next_message    = $messages.find(m => m.id === next_message_id)

            let model_icon

            // optionals needed for the in-between moment when
            // a provisional fork is created:

            if (message.role === 'user') {
                model_icon = next_message?.model?.icon
            } else {
                const next_ai_message_id = message_ids[message_ids.findIndex(id => id === message.id) + 2],
                      next_ai_message    = $messages.find(m => m.id === next_ai_message_id)
                model_icon = next_ai_message?.model?.icon
            }

            all_forks.push({
                index,
                is_active,
                provisional,
                next_message,
                model_icon
            })
        })

        return all_forks
    }

    const firstIndexOf = (fork_point) => {
        const index = $forks.findIndex(fork => {
            const index = fork.message_ids.findIndex(id => id === fork_point[0])
            return fork.message_ids[index + 1] === fork_point[1]
        })
        return index
    }

    const hasSiblings = (message) => {
        const parent = $messages.find(m => m.id === message.parent_id)
        return getForksAt(parent).length > 0
    }

    const switchToFork = async (fork_index) => {
        $active_fork = fork_index
        if (forking_from !== null) {
            forking_from              = null
            $is_provisionally_forking = false
            removeProvisionalFork()
        }
        dispatch('chatModified')
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

    const updateForksAfterDelete = () => {
        for (let i = 0; i < $forks.length; i++) {
            const fork            = $forks[i],
                  last_forked_at  = fork.forked_at[fork.forked_at.length - 1],
                  last_message_id = fork.message_ids[fork.message_ids.length - 1],
                  last_message    = $messages[last_message_id]

            if (last_message?.role === 'assistant' && last_forked_at === last_message_id) {

                //  If we've deleted messages back to a fork point, (re)set the fork
                //  to provisional.

                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_forked_at)) {
                        forking_from              = _i
                        $forks[i].provisional     = true
                        $is_provisionally_forking = true
                    }
                }
            } else if (last_message?.role === 'user') {

                //  If we've deleted 1 out of 2 replies, so there's now only one
                //  fork left, remove the fork point (`forked_at`) from the one
                //  remaining fork then switch to it.
                //
                //  If we've deleted 1 out of 3+ replies, switch to the closest
                //  sibling fork, e.g.:
                //      - if we've deleted fork 4 of 4, switch to fork 3 of 3.
                //      - if we've deleted fork 1 of 4, switch to fork 2 of 3.
                //      - if we've deleted fork 2 of 4, switch to fork 1 of 3.

                let sibling_indexes = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_message_id)) sibling_indexes.push(_i)
                }

                if (sibling_indexes.length === 1) {
                    let _i = sibling_indexes[0]
                    $forks[_i].forked_at = $forks[_i].forked_at.filter(id => id !== last_forked_at)
                    if (_i < i) {
                        switchToFork(_i)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(_i - 1)
                    }
                } else if (sibling_indexes.length > 1) {

                    //  find the element closest to i in `sibling_indexes` that
                    //  is less than it.  If there is no such element, use the
                    //  first element.

                    let closest_index = sibling_indexes.reduce((closest, current) => {
                        return (current < i && current > closest) ? current : closest
                    }, sibling_indexes[0])

                    if (closest_index < i) {
                        switchToFork(closest_index)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(closest_index - 1)
                    }
                }
            }
        }
        $forks = $forks
    }

    const deselectText = () => {
        const selection = window.getSelection()
        if (selection) selection.removeAllRanges()
        highlight_action_visible = false
    }

    const handleWheel = (e) => {
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

    const handleScroll = () => {
        const bottom = chat.scrollHeight - chat.clientHeight
        $is_scrolled_to_bottom = chat.scrollTop >= bottom - 160

        if (highlight_action_visible) {
            const selection = window.getSelection()
            if (selection && !selection.isCollapsed) {
                positionHighlightAction(selection)
            }
        }
    }

    const mouseup = async (e) => {
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

    const mousedown = (e) => {
        if (e.target.closest('.highlight-action')) return
        highlight_action_visible = false
    }

    const selectionchange = () => {
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
        dispatch('quoteSelectedText')
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
            dispatch('save')
        }
    }
</script>

<svelte:document on:keydown={keydown} on:mousedown={mousedown} on:selectionchange={selectionchange}/>

<section
    class='chat'
    class:frozen={$loader_active || $prompt_editor_active}
    bind:this={chat}
    on:wheel={handleWheel}
    on:scroll={handleScroll}
    on:mouseup={mouseup}
>
    {#if $usage.total_responses > 0}
        <UsageStats/>
    {/if}

    <div class='messages'>
        {#each processed_messages as message (message.id)}
            <Message
                bind:this={message_refs[message.id]}
                message={message}
                bind:scroll_reasoning_interrupted={scroll_reasoning_interrupted}
                on:regenerateReply={regenerateReply}
                on:deleteOne={() => deleteMessage(false)}
                on:deleteBoth={() => deleteMessage(true)}
                on:addReply={(event) => addReply(event.detail.message_id)}
                on:forkFrom={(event) => forkFrom(event.detail.message_id)}
                on:switchToFork={(event) => switchToFork(event.detail.fork_index)}
                on:cancelProvisionalFork={cancelProvisionalFork}
                on:save
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
