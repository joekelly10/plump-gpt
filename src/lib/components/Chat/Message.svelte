<script>
    import { createEventDispatcher } from 'svelte'
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { stars } from '$lib/stores/chat'
    import { is_hovering, is_deleting, is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { is_sending, is_streaming as api_is_streaming } from '$lib/stores/api'
    import { smoothScroll } from '$lib/utils/helpers'
    import { deleteHighlight } from '$lib/utils/highlighter'
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
    import PromptForks from '$lib/components/Message/PromptForks.svelte'
    import ReplyForks from '$lib/components/Message/ReplyForks.svelte'
    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let message,
               scroll_reasoning_interrupted

    let element        = null,
        show_info      = false,
        reasoning_div  = null,
        temp_highlight = false,
        temp_timer     = null

    $: is_starred             = $stars.includes(message.id)
    $: is_streaming           = message.is_last && message.role === 'assistant' && $api_is_streaming
    $: no_message             = !message.content && !message.reasoning_content
    $: has_finished_reasoning = message.content.length > 0

    $: message_content = DOMPurify.sanitize(marked(message.content))

    $: add_reply_highlight  = $is_hovering.add_reply.includes(message.id)
    $: regenerate_highlight = $is_hovering.regenerate.includes(message.id)
    $: star_highlight       = $is_hovering.star.includes(message.id)
    $: delete_highlight     = !(message.role === 'user' && message.forks.length > 1) && $is_hovering.delete.includes(message.id)

    export const getOffsetTop = () => element.offsetTop

    export const scrollReasoningToBottom = () => {
        if (is_streaming && reasoning_div && !scroll_reasoning_interrupted) {
            const bottom   = reasoning_div.scrollHeight - reasoning_div.clientHeight,
                  distance = bottom - reasoning_div.scrollTop
            if (distance < 300) {
                smoothScroll(reasoning_div, bottom, 250, 'cubicOut')
            } else {
                smoothScroll(reasoning_div, bottom, 500, 'quartOut')
            }
        }
    }

    export const tempHighlight = () => {
        clearTimeout(temp_timer)
        temp_highlight = true
        temp_timer     = setTimeout(() => { temp_highlight = false }, 2500)
    }

    const toggleStar = () => {
        if (is_starred) {
            $stars = $stars.filter(id => id !== message.id)
            console.log(`⭐️ Unstarred ${message.id}...`)
        } else {
            $stars = [...$stars, message.id]
            console.log(`⭐️ Starred ${message.id}...`)
        }
        dispatch('save')
    }

    const handleClick = (e) => {
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
            dispatch('save')
        } else {
            all_spans.forEach(span => { span.classList.remove('deleting') })
        }
    }
</script>

<div
    bind:this={element}
    id='message-{message.id}'
    data-message_id={message.id}
    class='message {message.role}'
    class:starred={is_starred}
    class:streaming={is_streaming}
    class:no-message={no_message}
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:add-reply-highlight={add_reply_highlight}
    class:star-highlight={star_highlight}
    class:temp-highlight={temp_highlight}
    class:no-forks={message.forks.length === 0}
    out:slide={{ duration: $is_deleting ? 250 : 0, easing: quartOut }}
    in:slide={{ delay: $is_deleting ? 500 : 0, duration: $is_deleting ? 250 : 0, easing: quartOut }}
    on:click={handleClick}
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
                    bind:reasoning_div
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
            message={message}
            is_starred={is_starred}
            showing_message_info={show_info}
            on:addReply
            on:regenerateReply
            on:deleteOne
            on:deleteBoth
            on:forkFrom
            on:toggleStar={toggleStar}
        />
    {:else if $is_provisionally_forking && message.is_last}
        <ProvisionalForkControls
            message={message}
            on:addReply
            on:cancelProvisionalFork
        />
    {/if}

    {#if message.role === 'assistant' && add_reply_highlight}
        <HoverInfoAddReply/>
    {:else if message.role === 'assistant' && regenerate_highlight}
        <HoverInfoRegenerate/>
    {:else if message.role === 'assistant' && delete_highlight}
        <HoverInfoDelete small={element.clientHeight < 140} />
    {:else if message.role === 'assistant' && star_highlight}
        <HoverInfoStar is_starred={is_starred} small={element.clientHeight < 140} />
    {/if}
</div>

{#if message.role === 'user' && message.forks.length > 1}
    <PromptForks
        message={message}
        on:switchToFork
    />
{/if}

{#if message.role === 'assistant' && message.forks.length > 0}
    <ReplyForks
        message={message}
        on:switchToFork
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
        transition:   padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s, background-color easing.$quart-out 0.125s, box-shadow easing.$quart-out 0.125s
        +shared.code_block_styles

        &:first-of-type
            margin-top: space.$default-padding

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-lighter

            &:not(.streaming)
                transition: background-color easing.$quart-out 0.075s, box-shadow easing.$quart-out 0.075s, top easing.$quart-out 0.125s

                &.delete-highlight
                    background-color: color.adjust($delete-highlight-bg, $alpha: -0.4)
                    text-decoration:  line-through
                    color:            $delete-highlight-color
                
                &.add-reply-highlight
                    z-index:          999
                    box-shadow:       0 0 0 1.5px $blue, 0 1.5px 9px 1.5px color.adjust($background-darker, $alpha: -0.75)
                    border-radius:    8px 8px 1.5px 1.5px
                    background-color: $regenerate-highlight-bg

                    &.no-forks
                        top:        5px
                        transition: background-color easing.$quart-out 0.075s, box-shadow easing.$quart-out 0.075s, top easing.$quart-out 0.125s

                        .content
                            transition: filter easing.$quart-out 0.2s

                &.temp-highlight
                    z-index:          999
                    background-color: color.adjust($background-lighter, $lightness: -2.5%)
                    box-shadow:       0 0 0 1.5px $off-white
                    border-radius:    8px 8px 1.5px 1.5px

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter

            &:after
                content:          ''
                position:         absolute
                top:              0
                left:             0
                width:            100%
                height:           100%
                box-sizing:       border-box
                border-radius:    1.5px 1.5px 8px 8px
                background-image: linear-gradient(to bottom, color.adjust($background, $alpha: -0.5), color.adjust($background, $alpha: -0.75))
                opacity:          0
                transition:       opacity easing.$quart-out 0.1s
                pointer-events:   none

            &:not(.streaming)
                transition: background-color easing.$quart-out 0.075s, box-shadow easing.$quart-out 0.075s

                &.add-reply-highlight
                    .content,
                    :global(.avatar-container)
                        filter: blur(2px)
                        color:  $blue-grey

                    &:after
                        opacity: 1

                &.delete-highlight
                    box-shadow:       0 0 0 1.5px $coral
                    border-radius:    1.5px 1.5px 8px 8px
                    background-color: $delete-highlight-bg
                    text-decoration:  line-through
                    color:            $delete-highlight-color
                
                &.regenerate-highlight
                    box-shadow:       0 0 0 1.5px $blue
                    border-radius:    1.5px 1.5px 8px 8px
                    background-color: $regenerate-highlight-bg
                    text-decoration:  line-through
                    color:            $regenerate-highlight-color

                    :global
                        blockquote
                            background-color: color.mix($background, $regenerate-highlight-bg, 33%)
                            color:            $regenerate-highlight-color

                            blockquote
                                background-color: color.mix($background, $regenerate-highlight-bg, 50%)

                        code, pre code, .copy-code-button
                            background-color: color.mix($background-darker, $regenerate-highlight-bg, 25%)
                            color:            $regenerate-highlight-color
                            text-decoration:  line-through
                
                &.star-highlight
                    background-color: $star-highlight-bg
                    box-shadow:       0 0 0 1.5px $yellow
                    border-radius:    1.5px 1.5px 8px 8px

                    :global
                        blockquote
                            background-color: color.mix($background, $star-highlight-bg, 85%)

                            blockquote
                                background-color: color.mix($background, $star-highlight-bg, 90%)

                        code, pre code
                            background-color: color.mix($background-darker, $star-highlight-bg, 85%)
                
                &.temp-highlight
                    background-color: color.adjust($background-lighter, $lightness: -2.5%)
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

            &:not(.no-message)
                padding-bottom: 1.25 * space.$default-padding
                animation:      streaming 1.5s linear infinite

        &.starred
            background-color: color.adjust($yellow, $alpha: -0.6)

            :global
                blockquote
                    background-color: color.mix($background, $star-highlight-bg, 85%)

                    blockquote
                        background-color: color.mix($background, $star-highlight-bg, 90%)

                code, pre code
                    background-color: color.mix($background-darker, $star-highlight-bg, 85%)

        &.delete-highlight
            :global
                blockquote
                    background-color: color.mix($background, $delete-highlight-bg, 25%)
                    color:            $delete-highlight-color
                
                code, pre code, .copy-code-button
                    background-color: color.mix($background-darker, $delete-highlight-bg, 25%)
                    color:            $delete-highlight-color
                    text-decoration:  line-through
    
    .content
        transition: filter easing.$quart-out 0.1s

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

    :global(strong ._text-highlight)
        font-weight: 750

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
            border-bottom: 8px solid $background-lighter
        67%
            border-bottom: 8px solid white(0.5)
        75%
            border-bottom: 8px solid white(0.5)
        100%
            border-bottom: 8px solid $background-lighter

    @keyframes streaming-no-message
        0%
            border-bottom: 8px solid $background-lighter
        67%
            border-bottom: 8px solid color.adjust($pale-blue, $alpha: -0.5)
        75%
            border-bottom: 8px solid color.adjust($pale-blue, $alpha: -0.5)
        100%
            border-bottom: 8px solid $background-lighter
</style>
