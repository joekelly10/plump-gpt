<script>
    import { createEventDispatcher } from 'svelte'
    import { slide, fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { stars } from '$lib/stores/chat'
    import { is_hovering, is_deleting, is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { is_sending, is_streaming } from '$lib/stores/api'
    import { smoothScroll } from '$lib/utils/helpers'
    import { deleteHighlight } from '$lib/utils/highlighter'
    import { marked } from 'marked'

    import MessageAvatar from '$lib/components/Chat/MessageAvatar.svelte'
    import MessageInfo from '$lib/components/Chat/MessageInfo.svelte'
    import MessageControls from '$lib/components/Chat/MessageControls.svelte'
    import ProvisionalForkControls from '$lib/components/Chat/ProvisionalForkControls.svelte'
    import HoverInfoAddReply from '$lib/components/Chat/HoverInfoAddReply.svelte'
    import HoverInfoRegenerate from '$lib/components/Chat/HoverInfoRegenerate.svelte'
    import HoverInfoDelete from '$lib/components/Chat/HoverInfoDelete.svelte'
    import HoverInfoStar from '$lib/components/Chat/HoverInfoStar.svelte'
    import PromptForks from '$lib/components/Chat/PromptForks.svelte'
    import ReplyForks from '$lib/components/Chat/ReplyForks.svelte'
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

    $: starred                = $stars.includes(message.id)
    $: streaming              = message.is_last && message.role === 'assistant' && $is_streaming
    $: no_message             = !message.content && !message.reasoning_content
    $: has_finished_reasoning = message.content.length > 0

    // Match < or > that's not inside `inline code` or ``` code blocks
    $: content = message.content.replace(/(?<!^|\n)[<>](?![^`]*`)(?![^```]*```)/g,char => ({ '<': '&lt;', '>': '&gt;' }[char]))

    $: add_reply_highlight  = $is_hovering.add_reply.includes(message.id)
    $: regenerate_highlight = $is_hovering.regenerate.includes(message.id)
    $: star_highlight       = $is_hovering.star.includes(message.id)
    $: delete_highlight     = !(message.role === 'user' && message.forks.length > 1) && $is_hovering.delete.includes(message.id)

    export const getOffsetTop = () => element.offsetTop

    export const scrollReasoningToBottom = () => {
        if (streaming && reasoning_div && !scroll_reasoning_interrupted) {
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
        if (starred) {
            $stars = $stars.filter(id => id !== message.id)
            console.log(`⭐️ Unstarred ${message.id}...`)
        } else {
            $stars = [...$stars, message.id]
            console.log(`⭐️ Starred ${message.id}...`)
        }
        dispatch('save')
    }

    const handleWheel = (e) => {
        const scrolled_down = e.deltaY > 0,
              on_reasoning  = e.target.closest('.reasoning-content')
        if (scrolled_down && on_reasoning) {
            const threshold = 100,
                  bottom    = reasoning_div.scrollHeight - reasoning_div.clientHeight
            if (reasoning_div.scrollTop >= bottom - threshold) {
                scroll_reasoning_interrupted = false
            }
        }
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
    class:starred={starred}
    class:streaming={streaming}
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
                {#if streaming}
                    Waiting for {message.model.short_name} to speak<WaitingDots/>
                {:else}
                    <span class='status-text-emoji'>❌</span> No message received
                {/if}
            </p>
        {:else}
            {#if message.reasoning_content}
                <div
                    class='reasoning-content'
                    bind:this={reasoning_div}
                    on:wheel={handleWheel}
                >
                    <p class='reasoning-title'>
                        Thinking...
                    </p>
                    {@html marked(message.reasoning_content)}
                    {#if has_finished_reasoning}
                        <div class='reasoning-summary' in:fly={{ x: -4, duration: 125, easing: quartOut }}>
                            Thought for
                            <span class='reasoning-token-count'>
                                {streaming ? '~' : ''}{message.usage.reasoning_tokens}
                            </span>
                            tokens
                        </div>
                    {/if}
                </div>
            {/if}
            {@html marked(content)}
        {/if}
    </div>

    <MessageAvatar
        bind:show_info
        message={message}
    />

    {#if show_info}
        <MessageInfo
            message={message}
        />
    {/if}

    {#if message.role === 'assistant' && !($is_sending || $is_streaming || $is_provisionally_forking)}
        <MessageControls
            bind:message
            starred={starred}
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
            bind:message
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
        <HoverInfoStar starred={starred} small={element.clientHeight < 140} />
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
                    color:            color.adjust(color.adjust($coral, $lightness: 20%), $alpha: -0.33)
                
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
                    color:            color.adjust(color.adjust($coral, $lightness: 20%), $alpha: -0.33)
                
                &.regenerate-highlight
                    box-shadow:       0 0 0 1.5px $blue
                    border-radius:    1.5px 1.5px 8px 8px
                    background-color: $regenerate-highlight-bg
                    text-decoration:  line-through
                    color:            color.adjust($blue-grey, $alpha: -0.25)
                
                &.star-highlight
                    background-color: color.adjust($yellow, $alpha: -0.7)
                    box-shadow:       0 0 0 1.5px $yellow
                    border-radius:    1.5px 1.5px 8px 8px
                
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
    
    .reasoning-content
        margin-bottom:    32px
        padding:          24px space.$default-padding
        max-height:       290px
        overflow-y:       auto
        border-radius:    8px
        background-color: black(0.46)
        font-size:        14px
        color:            color.adjust($off-white, $alpha: -0.5)
        
        &::-webkit-scrollbar
            width:      6px
            height:     6px
            background: transparent

        &::-webkit-scrollbar-thumb
            background:    color.adjust($off-white, $alpha: -0.5)
            border-radius: 99px
            cursor:        grab

        :global(p)
            margin-bottom: 20px
            font-size:     14px
            line-height:   28px

            &:last-child
                margin-bottom: 0
    
        .reasoning-title
            font-weight: 600

        .reasoning-summary
            display:          inline-block
            margin:           12px 0
            padding:          12px 24px
            border-radius:    99px
            background-color: color.adjust($off-white, $alpha: -0.5)
            font-size:        12px
            font-weight:      450
            text-align:       center
            color:            $background-darker

            .reasoning-token-count
                font-weight: 600
    
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
