<script>
    import { messages } from '$lib/stores/chat'
    import { formatDate } from '$lib/utils/helpers'

    export let message

    const getUserTimestamp = () => {
        const i = $messages.findIndex(m => m.id === message.id)
        return $messages[i + 1].timestamp
    }
</script>

<div class='message-info'>
    {#if message.role === 'assistant'}
        <div class='model-name'>
            {message.model.name}
        </div>
        <div class='timestamp'>
            {@html formatDate(message.timestamp)}
        </div>
    {:else if message.role === 'user'}
        <div class='timestamp'>
            {@html formatDate(getUserTimestamp())}
        </div>
    {/if}
</div>

<style lang='sass'>
    .message-info
        font-size:   14px
        font-weight: 450
        line-height: font.$line-height-14px
        color:       $background-200
</style>
