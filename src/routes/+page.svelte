<script>
    import { messages, loader_active, prompt_editor_active } from '$lib/stores/chat'

    import Header from '$lib/components/Header.svelte'
    import Chat from '$lib/components/Chat.svelte'
    import Input from '$lib/components/Input.svelte'
    import Loader from '$lib/components/Loader.svelte'
    import PromptEditor from '$lib/components/PromptEditor.svelte'
    import ScreenCover from '$lib/components/ScreenCover.svelte'

    let header,
        chat,
        input,
        title

    $: title = $messages.length > 1 ? $messages[1].content : 'Plump GPT - Fattens your thoughts'

    const chatModified    = () => input.chatLoaded()
    const regenerateReply = () => input.regenerateReply()
    const addReply        = () => input.addReply()
    const save            = () => header.save()
    const sendingMessage  = () => chat.sendingMessage()

    const scrollChatToBottom = (event) => {
        chat.scrollToBottom({ forced: event.detail?.forced ?? false })
    }

    const chatLoaded = () => {
        chat.scrollToBottom({ delay: 150, forced: true })
        input.chatLoaded({ switch_model: true })
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='plump-gpt' class:blur={$loader_active || $prompt_editor_active}>
    <Header
        bind:this={header}
    />
    <Chat
        bind:this={chat}
        on:chatModified={chatModified}
        on:regenerateReply={regenerateReply}
        on:addReply={addReply}
        on:save={save}
    />
    <Input
        bind:this={input}
        on:sendingMessage={sendingMessage}
        on:scrollChatToBottom={scrollChatToBottom}
        on:save={save}
    />
</main>

{#if $loader_active}
    <Loader
        on:chatLoaded={chatLoaded}
    />
{/if}

{#if $prompt_editor_active}
    <PromptEditor/>
{/if}

<ScreenCover/>

<style lang='sass'>
    +shared.globals

    .plump-gpt
        display:          flex
        flex-flow:        column nowrap
        height:           100vh
        min-width:        breakpoint.$cover-at-width
        box-sizing:       border-box
        background-color: $background
        transform:        scale(0.99)
        filter:           blur(4px)
        transition:       transform easing.$quart-out 0.1s, filter easing.$quart-out 0.1s
    
    @media (min-width: breakpoint.$cover-at-width) and (min-height: breakpoint.$cover-at-height)
        .plump-gpt
            transform:  none
            filter:     none
            transition: filter easing.$quart-out 0.1s 0.05s, transform easing.$quart-out 0.1s 0.05s

            &.blur
                transform:  scale(0.99)
                filter:     blur(4px)
                transition: transform easing.$quart-out 0.1s, filter easing.$quart-out 0.1s
</style>
