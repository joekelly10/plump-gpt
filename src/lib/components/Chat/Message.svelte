<script>
    import { createEventDispatcher } from 'svelte'
    import { slide, fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { deleting, provisionally_forking, stars, highlights } from '$lib/stores/chat'
    import { api_status } from '$lib/stores/ai'
    import { smoothScroll } from '$lib/utils/helpers'
    import { marked } from 'marked'

    import MessageControls from '$lib/components/Chat/MessageControls.svelte'
    import ProvisionalForkControls from '$lib/components/Chat/ProvisionalForkControls.svelte'
    import MessageInfo from '$lib/components/Chat/MessageInfo.svelte'
    import PromptForks from '$lib/components/Chat/PromptForks.svelte'
    import ReplyForks from '$lib/components/Chat/ReplyForks.svelte'
    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    const dispatch = createEventDispatcher()

    export let message,
               scroll_reasoning_interrupted

    let element        = null,
        show_info      = false,
        show_copied    = false,
        copy_timer     = null,
        reasoning_div  = null,
        temp_highlight = false,
        temp_timer     = null

    $: starred   = $stars.includes(message.id)
    $: streaming = message.is_last && message.role === 'assistant' && $api_status === 'streaming'
    $: content   = message.content.replace(
        // Match < or > that's not inside `inline code` or ``` code blocks
        /(?<!^|\n)[<>](?![^`]*`)(?![^```]*```)/g,
        char => ({ '<': '&lt;', '>': '&gt;' }[char])
    )

    $: add_reply_highlight  = $highlights.add_reply.includes(message.id)
    $: regenerate_highlight = $highlights.regenerate.includes(message.id)
    $: delete_highlight     = !(message.role === 'user' && message.forks.length > 1) && $highlights.delete.includes(message.id)

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

    const copyMessageToClipboard = async () => {
        clearTimeout(copy_timer)
        await navigator.clipboard.writeText(message.content)
        show_copied = true
        copy_timer = setTimeout(() => { show_copied = false }, 2000)
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
</script>

<div
    bind:this={element}
    id='message-{message.id}'
    class='message {message.role}'
    class:starred={starred}
    class:streaming={streaming}
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:add-reply-highlight={add_reply_highlight}
    class:temp-highlight={temp_highlight}
    out:slide={{ duration: $deleting ? 250 : 0, easing: quartOut }}
    in:slide={{ delay: $deleting ? 500 : 0, duration: $deleting ? 250 : 0, easing: quartOut }}
>
    {#if message.role === 'assistant' && $api_status !== 'streaming' && !$provisionally_forking}
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
    {:else if $provisionally_forking && message.is_last}
        <ProvisionalForkControls
            bind:message
            on:addReply
            on:cancelProvisionalFork
        />
    {/if}

    {#if show_info}
        <MessageInfo
            message={message}
        />
    {/if}

    <div class='avatar-container'>
        {#if message.role === 'user'}
            <img
                class='avatar user'
                src='/img/avatar.png'
                alt='You'
                on:dblclick={copyMessageToClipboard}
            >
        {:else}
            <img
                class='avatar gpt'
                src='/img/icons/models/{message.model.icon}'
                alt='{message.model.name}'
                on:mouseenter={() => { show_info = true }}
                on:mouseleave={() => { show_info = false }}
                on:dblclick={copyMessageToClipboard}
            >
        {/if}
        {#if show_copied}
            <div
                class='copied-feedback'
                in:fly={{ y: 8, duration: 100, easing: quartOut }}
                out:fade={{ duration: 100, easing: quartOut }}
            >
                Message copied!
            </div>
        {/if}
    </div>

    <div class='content'>
        {#if !message.content && !message.reasoning_content}
            <p class='status-text'>
                {#if streaming}
                    <span class='status-text-emoji'>💤</span> Waiting for {message.model.short_name} to speak<WaitingDots/>
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
                    {@html marked(message.reasoning_content)}
                </div>
            {/if}
            {@html marked(content)}
        {/if}
    </div>
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
        margin:       1px 0
        box-sizing:   border-box
        padding:      space.$default-padding
        padding-left: space.$avatar-container-width
        border:       0px solid transparent
        transition:   padding-bottom easing.$quart-out 0.25s, border-bottom easing.$quart-out 0.25s, background-color easing.$quart-out 0.125s, box-shadow easing.$quart-out 0.125s
        +shared.code_block_styles

        &:first-of-type
            margin-top: space.$default-padding

        &.user
            border-radius:    8px 8px 0 0
            background-color: $background-lighter

            &.delete-highlight
                background-color: color.adjust($delete-highlight-bg, $alpha: -0.4)
                transition:       none
                text-decoration:  line-through
            
            &.add-reply-highlight
                z-index:          999
                box-shadow:       0 0 0 2px $blue
                border-radius:    8px 8px 1px 1px
                background-color: $regenerate-highlight-bg
                transition:       none

        &.assistant
            margin-bottom:    space.$default-padding
            border-radius:    0 0 8px 8px
            background-color: $background-lighter

            &.delete-highlight
                box-shadow:       0 0 0 2px $coral
                border-radius:    1px 1px 8px 8px
                background-color: $delete-highlight-bg
                text-decoration:  line-through
                transition:       none
            
            &.regenerate-highlight
                box-shadow:       0 0 0 2px $blue
                border-radius:    1px 1px 8px 8px
                background-color: $regenerate-highlight-bg
                text-decoration:  line-through
                transition:       none
        
        &.streaming
            min-height:     space.$avatar-container-width
            padding-bottom: 1.25 * space.$default-padding
            animation:      streaming 1.5s linear infinite

        &.starred
            background-color: color.adjust($yellow, $alpha: -0.5)

        &.temp-highlight
            z-index:          99
            background-color: color.adjust($background-lighter, $lightness: -2.5%)
            box-shadow:       0 0 0 2px $off-white
            transition:       none

            &.starred
                background-color: color.adjust($yellow, $alpha: -0.575)

    .avatar-container
        display:         flex
        align-items:     center
        justify-content: center
        position:        absolute
        top:             0
        left:            0
        width:           space.$avatar-container-width
        height:          space.$avatar-container-width
        text-align:      center
        user-select:     none

        .avatar
            height:     32px
            transition: transform easing.$quart-out 0.125s
            cursor:     pointer

            &.user
                border-radius: 8px

            &:hover
                transform:  scale(1.1)
                transition: none
            
            &:active
                transform:  scale(1.05)
                transition: none
        
        .copied-feedback
            position:         absolute
            bottom:           100%
            left:             50%
            transform:        translate(-50%, 4px)
            padding:          12px 24px
            border-radius:    8px
            background-color: $background-darker
            font-size:        14px
            font-weight:      500
            line-height:      font.$line-height-14px
            color:            $off-white
            white-space:      nowrap

            &:after
                content:        ''
                position:       absolute
                top:            100%
                left:           50%
                transform:      translateX(-50%)
                border-width:   8px
                border-style:   solid
                border-color:   $background-darker transparent transparent
    
    .reasoning-content
        margin-bottom:    32px
        padding:          math.round(0.75 * space.$default-padding) space.$default-padding
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
</style>
