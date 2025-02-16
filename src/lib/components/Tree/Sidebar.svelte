<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { marked } from 'marked'
    import MessageInfo from '$lib/components/Tree/MessageInfo.svelte'
    import SystemPromptIcon from '$lib/components/Icons/SystemPrompt.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    export let message

    $: preview = message?.content.slice(0, 500) + (message?.content.length > 500 ? ' [...]' : '')
</script>

<div class='tree-sidebar' in:fade={{ duration: 250, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
    <div class='inner'>
        <div class='avatar-container'>
            {#if message.role === 'system'}
                <SystemPromptIcon className='icon system-prompt-icon' />
            {:else if message.role === 'assistant'}
                <img class='avatar ai' src='/img/icons/models/{message.model.icon}' alt='{message.model.name}' />
            {:else}
                <img class='avatar user' src='/img/avatar.png' alt='You' />
            {/if}
        </div>
        <div class='message-preview'>
            {@html marked(preview)}
        </div>
        <MessageInfo message={message} />
    </div>
</div>

<style lang='sass'>
    .tree-sidebar
        display:          flex
        flex-direction:   column
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        z-index:          20
        width:            432px
        height:           100%
        box-sizing:       border-box
        padding-top:      space.$header-height
        padding-left:     16px
        padding-right:    16px
        background-image: linear-gradient(to right, color.adjust($background-darkest, $lightness: -2%), transparent)
        pointer-events:   none

    .inner
        width:       100%
        min-height:  600px
        max-height:  90%
        overflow:    hidden
        box-sizing:  border-box
        padding:     0 space.$default-padding
        font-size:   16px
        line-height: space.$paragraph-line-height
        color:       $off-white

    .avatar-container
        display:         flex
        align-items:     center
        justify-content: flex-start

        .avatar
            width:         32px
            border-radius: 8px
        
        :global
            .system-prompt-icon
                height: 32px
                fill:   $blue-grey

    .message-preview
        margin-top:    space.$default-padding
        margin-bottom: space.$default-padding

        :global
            pre
                font-size:   14px
                line-height: 21px
                color:       $blue-grey
</style>
