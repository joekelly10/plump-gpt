<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { marked } from 'marked'
    import DOMPurify from 'dompurify'

    export let message,
               is_streaming,
               has_finished_reasoning,
               scroll_reasoning_interrupted,
               reasoning_div,
               delete_highlight,
               regenerate_highlight,
               star_highlight,
               is_starred

    $: reasoning_content = DOMPurify.sanitize(marked(message.reasoning_content))

    const handleWheel = (e) => {
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
    class='reasoning-content'
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:star-highlight={star_highlight}
    class:starred={is_starred}
    bind:this={reasoning_div}
    on:wheel={handleWheel}
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
        background-color: $background-darker
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
        
        &.delete-highlight
            background-color: color.mix($background-darker, color.adjust($delete-highlight-bg, $alpha: -0.4), 25%)
            color:            color.adjust(color.adjust($coral, $lightness: 20%), $alpha: -0.33)

            &::-webkit-scrollbar-thumb
                background: color.adjust(color.adjust($coral, $lightness: 20%), $alpha: -0.33)

            .reasoning-summary
                background-color: color.adjust(color.adjust($coral, $lightness: 20%), $alpha: -0.33)
                text-decoration:  line-through
        
        &.regenerate-highlight
            background-color: color.mix($background-darker, color.adjust($regenerate-highlight-bg), 25%)
            color:            color.adjust($blue-grey, $alpha: -0.25)

            &::-webkit-scrollbar-thumb
                background: color.adjust($blue-grey, $alpha: -0.25)

            .reasoning-summary
                background-color: color.adjust($blue-grey, $alpha: -0.25)
                text-decoration:  line-through
        
        &.star-highlight,
        &.starred
            background-color: color.mix($background-darker, color.adjust($star-highlight-bg), 85%)

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
</style>
