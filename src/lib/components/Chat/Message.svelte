<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { stars } from '$lib/stores/chat'
    import { is_hovering, is_deleting, is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { is_sending, is_streaming as api_is_streaming } from '$lib/stores/api'
    import { diffusing_on } from '$lib/stores/ai'
    import { deleteHighlight } from '$lib/utils/highlighter'
    import { getToolUseHTML } from '$lib/templates/tool_use'
    import { marked } from 'marked'
    import DOMPurify from 'dompurify'

    import ReasoningContent from '$lib/components/Message/ReasoningContent.svelte'
    import Avatar from '$lib/components/Message/Avatar.svelte'
    import Info from '$lib/components/Message/Info.svelte'
    import Controls from '$lib/components/Message/Controls.svelte'
    import ProvisionalForkControls from '$lib/components/Message/ProvisionalForkControls.svelte'
    import HoverInfoAddReply from '$lib/components/Message/HoverInfoAddReply.svelte'
    import HoverInfoRegenerate from '$lib/components/Message/HoverInfoRegenerate.svelte'
    import HoverInfoDelete from '$lib/components/Message/HoverInfoDelete.svelte'
    import HoverInfoStar from '$lib/components/Message/HoverInfoStar.svelte'
    import HoverInfoFork from '$lib/components/Message/HoverInfoFork.svelte'
    import PromptForks from '$lib/components/Message/PromptForks.svelte'
    import ReplyForks from '$lib/components/Message/ReplyForks.svelte'
    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    export const getOffsetTop            = () => message_el.offsetTop,
                 scrollReasoningToBottom = () => _scrollReasoningToBottom(),
                 tempHighlight           = () => _tempHighlight()
    
    let {
        // actions
        scrollToBottom,
        addReply,
        regenerateReply,
        switchToFork,
        cancelFork,
        saveChat,
        deleteChat,

        // events
        onChatUpdated,

        // bindable
        forking_from                 = $bindable(null),
        scroll_reasoning_interrupted = $bindable(false),
        scroll_reasoning_pending_id  = $bindable(null),

        // passive
        message
    } = $props()

    let temp_timer

    let message_el        = $state(null), // component reference (nb: not reactive, but svelte 5 compiler sees {#if} conditional binding and expects $state)
        reasoning_content = $state(null),
        show_info         = $state(false),
        temp_highlight    = $state(false)
    
    const message_content        = $derived(DOMPurify.sanitize(marked(expandPlaceholders(message.content)))),
          no_message             = $derived(!message.content && !message.reasoning_content),
          has_finished_reasoning = $derived(message.content.length > 0),
          is_starred             = $derived($stars.includes(message.id)),
          is_streaming           = $derived(message.is_last && message.role === 'assistant' && $api_is_streaming),
          is_diffusing           = $derived(is_streaming && message.model.is_diffuser && $diffusing_on),
          add_reply_highlight    = $derived($is_hovering.add_reply.includes(message.id)),
          regenerate_highlight   = $derived($is_hovering.regenerate.includes(message.id)),
          star_highlight         = $derived($is_hovering.star.includes(message.id)),
          add_fork_highlight     = $derived($is_hovering.add_fork.includes(message.id)),
          add_fork_lowlight      = $derived($is_hovering.add_fork.some(id => id < message.id)),
          delete_highlight       = $derived(!(message.role === 'user' && message.forks.length > 1) && $is_hovering.delete.includes(message.id)),
          is_tiny_message        = $derived(message_el?.clientHeight < 140),
          is_small_message       = $derived(message_el?.clientHeight < 200)
    
    $effect(() => { scroll_reasoning_pending_id === message.id && scrollReasoningToBottom() })

    const _scrollReasoningToBottom = () => {
        if (!scroll_reasoning_interrupted) reasoning_content?.scrollToBottom()
        scroll_reasoning_pending_id = null
    }

    const _tempHighlight = () => {
        clearTimeout(temp_timer)
        temp_highlight = true
        temp_timer     = setTimeout(() => { temp_highlight = false }, 2500)
    }

    const expandPlaceholders = (content) => {
        if (message.role !== 'assistant') return content
        
        return content.replace(/{{TOOL_USE:(\w+)}}/g, (match, tool_use_id) => {
            const tool_use = message.tool_uses.find(tool_use => tool_use.id === tool_use_id)
            return tool_use ? getToolUseHTML(tool_use) : match
        })
    }

    const onclick = (e) => {
        const text_highlight = e.target.closest('._text-highlight')
        if (text_highlight) {
            const highlight_id = text_highlight.dataset.highlight_id
            confirmDeleteHighlight(highlight_id)
        }
    }

    const confirmDeleteHighlight = async (highlight_id) => {
        const all_spans = document.querySelectorAll(`._text-highlight[data-highlight_id="${highlight_id}"]`)
        all_spans.forEach(span => { span.classList.add('deleting') })

        // allow time for it to be painted (nb: tick doesn't work here)
        await new Promise(resolve => setTimeout(resolve, 10))

        if (confirm(`Delete this highlight?  Press OK to confirm.`)) {
            deleteHighlight(highlight_id)
            saveChat()
        } else {
            all_spans.forEach(span => { span.classList.remove('deleting') })
        }
    }
</script>

<div
    bind:this={message_el}
    id='message-{message.id}'
    data-message_id={message.id}
    class='message {message.role}'
    class:starred={is_starred}
    class:streaming={is_streaming}
    class:diffusing={is_diffusing}
    class:no-message={no_message}
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:add-reply-highlight={add_reply_highlight}
    class:star-highlight={star_highlight}
    class:add-fork-highlight={add_fork_highlight}
    class:add-fork-lowlight={add_fork_lowlight}
    class:temp-highlight={temp_highlight}
    class:no-forks={message.forks.length === 0}
    out:slide={{ duration: $is_deleting ? 250 : 0, easing: quartOut }}
    in:slide={{ delay: $is_deleting ? 500 : 0, duration: $is_deleting ? 250 : 0, easing: quartOut }}
    onclick={onclick}
>
    <div class='content'>
        {#if no_message}
            <p class='status-text'>
                {#if is_streaming}
                    Waiting for {message.model.short_name} to speak<WaitingDots/>
                {:else}
                    <span class='status-text-emoji'>❌</span> No message received
                {/if}
            </p>
        {:else}
            {#if message.reasoning_content}
                <ReasoningContent
                    bind:this={reasoning_content}
                    bind:scroll_reasoning_interrupted
                    message={message}
                    is_streaming={is_streaming}
                    has_finished_reasoning={has_finished_reasoning}
                    delete_highlight={delete_highlight}
                    regenerate_highlight={regenerate_highlight}
                    star_highlight={star_highlight}
                    is_starred={is_starred}
                />
            {/if}
            <div class='message-content'>
                {@html message_content}
            </div>
        {/if}
    </div>

    <Avatar
        bind:show_info
        message={message}
    />

    {#if show_info}
        <Info
            message={message}
        />
    {/if}

    {#if message.role === 'assistant' && !($is_sending || $api_is_streaming || $is_provisionally_forking)}
        <Controls
            bind:forking_from
            message={message}
            is_starred={is_starred}
            showing_message_info={show_info}
            addReply={addReply}
            regenerateReply={regenerateReply}
            switchToFork={switchToFork}
            scrollToBottom={scrollToBottom}
            saveChat={saveChat}
            deleteChat={deleteChat}
            onChatUpdated={onChatUpdated}
            is_small_message={is_small_message}
        />
    {:else if $is_provisionally_forking && message.is_last}
        <ProvisionalForkControls
            cancelFork={cancelFork}
        />
    {/if}

    {#if message.role === 'assistant' && add_reply_highlight}
        <HoverInfoAddReply small_message={is_small_message} />
    {:else if message.role === 'assistant' && regenerate_highlight}
        <HoverInfoRegenerate/>
    {:else if message.role === 'assistant' && delete_highlight}
        <HoverInfoDelete tiny_message={is_tiny_message} />
    {:else if message.role === 'assistant' && star_highlight}
        <HoverInfoStar is_starred={is_starred} tiny_message={is_tiny_message} />
    {:else if message.role === 'assistant' && add_fork_highlight}
        <HoverInfoFork/>
    {/if}
</div>

{#if message.role === 'user' && message.forks.length > 1}
    <PromptForks
        message={message}
        switchToFork={switchToFork}
    />
{/if}

{#if message.role === 'assistant' && message.forks.length > 0}
    <ReplyForks
        message={message}
        switchToFork={switchToFork}
    />
{/if}

<style lang='sass'>
    .message
        position:     relative
        top:          0
        margin:       1px 0
        box-sizing:   border-box
        padding:      space.$default-padding
        padding-left: space.$avatar-container-width
        box-shadow:   0 0 0 1.5px transparent
        border:       0px solid transparent
        +shared.code_block_styles

        &:first-of-type
            margin-top: space.$default-padding

        &:after
            content:          ''
            position:         absolute
            top:              0
            left:             0
            width:            100%
            height:           100%
            box-sizing:       border-box
            border-radius:    1.5px 1.5px 8px 8px
            background-image: linear-gradient(to bottom, color.adjust($background-500, $alpha: -0.5), color.adjust($background-500, $alpha: -0.75))
            opacity:          0
            transition:       opacity easing.$quart-out 0.1s
            pointer-events:   none

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-300

            &:after
                border-radius: 8px 8px 1.5px 1.5px

            &:not(.streaming)
                transition: background-color easing.$quart-out 0.075s, box-shadow easing.$quart-out 0.075s

                &.delete-highlight
                    background-color: color.adjust($delete-highlight-bg, $alpha: -0.4)
                    text-decoration:  line-through
                    color:            $delete-highlight-color
                
                &.add-reply-highlight
                    z-index:          999
                    box-shadow:       0 0 0 1.5px $blue, 0 1.5px 9px 1.5px color.adjust($background-700, $alpha: -0.75)
                    border-radius:    8px 8px 1.5px 1.5px
                    background-color: $regenerate-highlight-bg

                &.add-fork-lowlight
                    .content,
                    :global(.avatar-container)
                        filter: blur(2px)
                        color:  $blue-grey

                    &:after
                        opacity: 1

                &.temp-highlight
                    z-index:          999
                    background-color: color.adjust($background-300, $lightness: -2.5%)
                    box-shadow:       0 0 0 1.5px $off-white
                    border-radius:    8px 8px 1.5px 1.5px

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-300

            &:not(.streaming)
                transition: padding-bottom easing.$quart-out 0.25s, margin-bottom easing.$quart-out 0.125s, border-bottom easing.$quart-out 0.125s, border-radius easing.$quart-out 0.125s, background-color easing.$quart-out 0.075s, box-shadow easing.$quart-out 0.075s

                &.add-reply-highlight
                    .content,
                    :global(.avatar-container)
                        filter: blur(2px)
                        color:  $blue-grey

                    &:after
                        opacity: 1

                &.add-fork-lowlight
                    .content,
                    :global(.avatar-container)
                        filter: blur(2px)
                        color:  $blue-grey

                    &:after
                        opacity:          1
                        background-image: linear-gradient(to bottom, color.adjust($background-500, $alpha: -0.75), color.adjust($background-500, $alpha: -0.5))

                &.delete-highlight
                    box-shadow:       0 0 0 1.5px $coral
                    border-radius:    1.5px 1.5px 8px 8px
                    background-color: $delete-highlight-bg
                    text-decoration:  line-through
                    color:            $delete-highlight-color

                    .content
                        :global
                            .tool-use
                                background-color: color.mix($background-700, $delete-highlight-bg, 25%)
                                color:            $delete-highlight-color

                                .icon
                                    opacity: 0.25

                                .tool-use-value
                                    color: $delete-highlight-color
                
                &.regenerate-highlight
                    box-shadow:       0 0 0 1.5px $blue
                    border-radius:    1.5px 1.5px 8px 8px
                    background-color: $regenerate-highlight-bg
                    text-decoration:  line-through
                    color:            $regenerate-highlight-color

                    :global
                        blockquote
                            background-color: color.mix($background-500, $regenerate-highlight-bg, 33%)
                            color:            $regenerate-highlight-color

                            blockquote
                                background-color: color.mix($background-500, $regenerate-highlight-bg, 50%)

                        code, pre code, .copy-code-button
                            background-color: color.mix($background-700, $regenerate-highlight-bg, 25%)
                            color:            $regenerate-highlight-color
                            text-decoration:  line-through
                    
                    .content
                        :global
                            .tool-use
                                background-color: color.mix($background-500, $regenerate-highlight-bg, 33%)
                                color:            $regenerate-highlight-color

                                .icon
                                    opacity: 0.25

                                .tool-use-value
                                    color: $regenerate-highlight-color
                
                &.add-fork-highlight
                    // 56px is the height of the "Fork Here" hover info box
                    margin-bottom: 56px + space.$default-padding
                    border-radius: 0 0 0 1.5px
                    border-bottom: 1.5px solid $blue
                    transition:    margin-bottom easing.$quart-out 0.125s, border-bottom easing.$quart-out 0.075s

                &.star-highlight
                    background-color: $star-highlight-bg
                    box-shadow:       0 0 0 1.5px $yellow
                    border-radius:    1.5px 1.5px 8px 8px

                    :global
                        blockquote
                            background-color: color.mix($background-500, $star-highlight-bg, 85%)

                            blockquote
                                background-color: color.mix($background-500, $star-highlight-bg, 90%)

                        code, pre code
                            background-color: color.mix($background-700, $star-highlight-bg, 85%)
                    
                    .content
                        :global
                            .tool-use
                                background-color: color.mix($background-700, $star-highlight-bg, 85%)
                
                &.temp-highlight
                    background-color: color.adjust($background-300, $lightness: -2.5%)
                    box-shadow:       0 0 0 1.5px $off-white
                    border-radius:    1.5px 1.5px 8px 8px
                
                &.starred
                    &.star-highlight
                        background-color: color.adjust($yellow, $alpha: -0.666)
                        box-shadow:       0 0 0 1.5px $yellow
                        border-radius:    1.5px 1.5px 8px 8px

                    &.temp-highlight
                        background-color: color.adjust($yellow, $alpha: -0.575)
                        box-shadow:       0 0 0 1.5px $off-white

        &.streaming
            min-height: space.$avatar-container-width
            animation:  streaming-no-message 1.5s linear infinite
            transition: padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s, background-color easing.$quart-out 0.125s, box-shadow easing.$quart-out 0.125s

            &:not(.no-message)
                padding-bottom: 1.25 * space.$default-padding
                animation:      streaming 1.5s linear infinite

            &.diffusing
                color: color.adjust($off-white, $alpha: -0.33)

        &.starred
            background-color: color.adjust($yellow, $alpha: -0.6)

            :global
                blockquote
                    background-color: color.mix($background-500, $star-highlight-bg, 85%)

                    blockquote
                        background-color: color.mix($background-500, $star-highlight-bg, 90%)

                code, pre code
                    background-color: color.mix($background-700, $star-highlight-bg, 85%)

        &.delete-highlight
            :global
                blockquote
                    background-color: color.mix($background-500, $delete-highlight-bg, 25%)
                    color:            $delete-highlight-color
                
                code, pre code, .copy-code-button
                    background-color: color.mix($background-700, $delete-highlight-bg, 25%)
                    color:            $delete-highlight-color
                    text-decoration:  line-through
        
        :global
            ._text-highlight
                padding:          5px 0
                background-color: color.adjust($yellow, $alpha: -0.5)
                font-weight:      450
                cursor:           pointer

                &:hover
                    background-color: color.adjust($yellow, $alpha: -0.55)

                &:active
                    background-color: color.adjust($yellow, $alpha: -0.575)
                
                &.deleting
                    border-radius:    2px
                    box-shadow:       0 0 0 1px $coral
                    background-color: color.adjust($coral, $alpha: -0.5)
        
            strong
                ._text-highlight
                    font-weight: 750
    
    .content
        transition: filter easing.$quart-out 0.1s

        .message-content:first-child
            :global
                .tool-use
                    margin-top: -2px

        :global
            .tool-use
                display:          flex
                align-items:      center
                justify-content:  flex-start
                gap:              24px
                margin-bottom:    32px
                padding:          24px
                border-radius:    8px
                background-color: $background-700
                font-size:        14px
                line-height:      font.$line-height-14px
                font-weight:      450
                color:            $blue-grey

                .icon
                    height: 19px

                .tool-use-value
                    font-weight: 600
                    color:       $off-white

    .status-text
        font-size:   14px
        font-style:  italic
        font-weight: 450
        color:       $pale-blue

        .status-text-emoji
            margin-right: 8px
            font-style:   normal

    @keyframes streaming
        0%
            border-bottom: 8px solid $background-300
        67%
            border-bottom: 8px solid white(0.5)
        75%
            border-bottom: 8px solid white(0.5)
        100%
            border-bottom: 8px solid $background-300

    @keyframes streaming-no-message
        0%
            border-bottom: 8px solid $background-300
        67%
            border-bottom: 8px solid color.adjust($pale-blue, $alpha: -0.5)
        75%
            border-bottom: 8px solid color.adjust($pale-blue, $alpha: -0.5)
        100%
            border-bottom: 8px solid $background-300
</style>
