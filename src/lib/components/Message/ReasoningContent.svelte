<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { smoothScroll } from '$lib/utils/helpers'
    import { marked } from 'marked'
    import DOMPurify from 'dompurify'

    import WaitingDots from '$lib/components/Chat/WaitingDots.svelte'

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
        if (reasoning_div && !scroll_reasoning_interrupted) {
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
    class='reasoning-content-container'
    class:delete-highlight={delete_highlight}
    class:regenerate-highlight={regenerate_highlight}
    class:star-highlight={star_highlight}
    class:starred={is_starred}
>
    <div
        bind:this={reasoning_div}
        class='reasoning-content'
        onwheel={onwheel}
    >
        {@html reasoning_content}
    </div>

    <div class='reasoning-summary' in:fade={{ delay: 500, duration: 125, easing: quartOut }}>
        <img class='thinking-icon' src='/img/icons/thinking-grey.png' alt='Thinking' />
        <div class='reasoning-summary-text'>
            {#if !has_finished_reasoning}
                <strong>
                    Thinking<WaitingDots />
                </strong>
            {:else}
                Thought for<br>
                <strong>
                    {is_streaming || message.model.type === 'anthropic' ? '~' : ''}{message.usage.reasoning_tokens}
                    tokens
                </strong>
            {/if}
        </div>
    </div>
</div>

<style lang='sass'>
    .reasoning-content-container
        position:      relative
        margin-bottom: 32px

        &:first-child
            margin-top: -2px
        
        &.delete-highlight
            .reasoning-content
                background-color: black(0.075)
                color:            $delete-highlight-color

                &::-webkit-scrollbar-thumb
                    background: $delete-highlight-color

            .reasoning-summary
                text-decoration: line-through
                color:           $delete-highlight-color

                .thinking-icon
                    opacity: 0.5
                
                strong
                    color: $delete-highlight-color
        
        &.regenerate-highlight
            .reasoning-content
                background-color: black(0.075)
                color:            $regenerate-highlight-color

                &::-webkit-scrollbar-thumb
                    background: $regenerate-highlight-color

            .reasoning-summary
                text-decoration: line-through
                color:           $regenerate-highlight-color

                .thinking-icon
                    opacity: 0.5

                strong
                    color: $regenerate-highlight-color
        
        &.star-highlight,
        &.starred
            .reasoning-content
                background-color: color.adjust($background-350, $alpha: -0.85)

    .reasoning-content
        position:         relative
        margin-bottom:    32px
        padding:          24px space.$default-padding
        max-height:       290px
        overflow-y:       auto
        border-radius:    8px
        border:           1px dotted color.adjust($blue-grey, $alpha: -0.5)
        background-color: $background-350
        font-size:        14px
        line-height:      26px
        color:            $off-white

        &::-webkit-scrollbar
            width:      6px
            height:     6px
            background: transparent

        &::-webkit-scrollbar-thumb
            background:    $off-white
            border-radius: 99px
            cursor:        grab

        :global(p)
            margin-bottom: 20px
            font-size:     14px
            line-height:   28px

            &:last-child
                margin-bottom: 0

    .reasoning-summary
        display:     flex
        align-items: center
        gap:         24px
        box-sizing:  border-box
        font-size:   14px
        font-weight: 450
        line-height: font.$line-height-14px
        color:       $blue-grey

        strong
            font-weight: 700
            color:       $off-white

        .thinking-icon
            height: 19px
</style>
