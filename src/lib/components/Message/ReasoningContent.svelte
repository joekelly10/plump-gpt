<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { smoothScroll } from '$lib/utils/helpers'
    import { marked } from 'marked'
    import DOMPurify from 'dompurify'

    export const scrollToBottom = () => _scrollToBottom()

    let {
        // bindable
        scroll_reasoning_interrupted = $bindable(false),

        // passive
        message,
        is_streaming,
        has_finished_reasoning,
        delete_highlight,
        regenerate_highlight,
        star_highlight,
        is_starred
    } = $props()

    let reasoning_div

    const reasoning_content = $derived(DOMPurify.sanitize(marked(message.reasoning_content)))

    const _scrollToBottom = () => {
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

    const onwheel = (e) => {
        const scrolled_down    = e.deltaY > 0,
              was_on_reasoning = e.target.closest('.reasoning-content')
        if (scrolled_down && was_on_reasoning) {
            const threshold = 100,
                  bottom    = reasoning_div.scrollHeight - reasoning_div.clientHeight
            if (reasoning_div.scrollTop >= bottom - threshold) {
                scroll_reasoning_interrupted = false
            }
        }
    }
</script>

<div
    bind:this={reasoning_div}
    class='reasoning-content'
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:star-highlight={star_highlight}
    class:starred={is_starred}
    onwheel={onwheel}
>
    <p class='reasoning-title'>
        Thinking...
    </p>
    {@html reasoning_content}
    {#if has_finished_reasoning}
        <div class='reasoning-summary' in:fly={{ x: -4, duration: 125, easing: quartOut }}>
            Thought for
            <span class='reasoning-token-count'>
                {is_streaming ? '~' : ''}{message.usage.reasoning_tokens}
            </span>
            tokens
        </div>
    {/if}
</div>

<style lang='sass'>
    .reasoning-content
        margin-bottom:    32px
        padding:          24px space.$default-padding
        max-height:       290px
        overflow-y:       auto
        border-radius:    8px
        background-color: $background-700
        font-size:        14px
        line-height:      28px
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
        
        &.delete-highlight
            background-color: color.mix($background-700, $delete-highlight-bg, 25%)
            color:            $delete-highlight-color

            &::-webkit-scrollbar-thumb
                background: $delete-highlight-color

            .reasoning-summary
                background-color: $delete-highlight-color
                text-decoration:  line-through
        
        &.regenerate-highlight
            background-color: color.mix($background-700, $regenerate-highlight-bg, 25%)
            color:            $regenerate-highlight-color

            &::-webkit-scrollbar-thumb
                background: $regenerate-highlight-color

            .reasoning-summary
                background-color: $regenerate-highlight-color
                text-decoration:  line-through
        
        &.star-highlight,
        &.starred
            background-color: color.mix($background-700, $star-highlight-bg, 85%)

    .reasoning-title
        font-weight: 600

    .reasoning-summary
        display:          inline-block
        margin:           12px 0
        padding:          0 24px
        border-radius:    99px
        background-color: color.adjust($off-white, $alpha: -0.5)
        font-size:        12px
        font-weight:      450
        text-align:       center
        line-height:      40px
        color:            $background-700

        .reasoning-token-count
            font-weight: 600
</style>
