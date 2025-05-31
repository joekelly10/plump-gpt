<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { marked } from 'marked'

    export let message,
               streaming,
               has_finished_reasoning
</script>

<div class='reasoning-content'>
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

<style lang='sass'>
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
