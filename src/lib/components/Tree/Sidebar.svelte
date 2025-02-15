<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { marked } from 'marked'
    import MessageInfo from '$lib/components/Tree/MessageInfo.svelte'

    marked.use({ breaks: true, mangle: false, headerIds: false })

    export let message

    $: preview = message?.content.slice(0, 500) + (message?.content.length > 500 ? ' [...]' : '')
</script>

<div class='tree-sidebar' in:fade={{ duration: 250, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
    <div class='inner'>
        <div class='avatar-container'>
            {#if message.role === 'system'}
                <svg class='icon system-prompt-icon' viewBox='0 0 106.86 122.88'><g><path d='M46.77,116.58c1.74,0,3.15,1.41,3.15,3.15c0,1.74-1.41,3.15-3.15,3.15H7.33c-2.02,0-3.85-0.82-5.18-2.15 C0.82,119.4,0,117.57,0,115.55V7.33c0-2.02,0.82-3.85,2.15-5.18C3.48,0.82,5.31,0,7.33,0h90.02c2.02,0,3.85,0.83,5.18,2.15 c1.33,1.33,2.15,3.16,2.15,5.18v50.14c0,1.74-1.41,3.15-3.15,3.15c-1.74,0-3.15-1.41-3.15-3.15V7.33c0-0.28-0.12-0.54-0.31-0.72 c-0.19-0.19-0.45-0.31-0.72-0.31H7.33c-0.28,0-0.54,0.12-0.73,0.3C6.42,6.8,6.3,7.05,6.3,7.33v108.21c0,0.28,0.12,0.54,0.31,0.72 c0.19,0.19,0.45,0.31,0.73,0.31H46.77L46.77,116.58z M98.7,74.34c-0.51-0.49-1.1-0.72-1.78-0.71c-0.68,0.01-1.26,0.28-1.74,0.78 l-3.91,4.07l10.97,10.59l3.95-4.11c0.47-0.48,0.67-1.1,0.66-1.78c-0.01-0.67-0.25-1.28-0.73-1.74L98.7,74.34L98.7,74.34z M78.21,114.01c-1.45,0.46-2.89,0.94-4.33,1.41c-1.45,0.48-2.89,0.97-4.33,1.45c-3.41,1.12-5.32,1.74-5.72,1.85 c-0.39,0.12-0.16-1.48,0.7-4.81l2.71-10.45l0,0l20.55-21.38l10.96,10.55L78.21,114.01L78.21,114.01z M31.58,41.08 c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15s-1.41,3.15-3.15,3.15H31.58L31.58,41.08z M31.58,85.77c-1.74,0-3.16-1.43-3.16-3.19s1.41-3.19,3.16-3.19h20.47c1.74,0,3.16,1.43,3.16,3.19s-1.41,3.19-3.16,3.19H31.58 L31.58,85.77z M31.58,63.41c-1.74,0-3.15-1.41-3.15-3.15s1.41-3.15,3.15-3.15h41.54c1.74,0,3.15,1.41,3.15,3.15 s-1.41,3.15-3.15,3.15H31.58L31.58,63.41z'/></g></svg>
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
