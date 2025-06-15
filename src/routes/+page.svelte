<script>
    import { tree_active, loader_active, prompt_editor_active } from '$lib/stores/app'
    import { messages } from '$lib/stores/chat'

    import Header from '$lib/components/Header.svelte'
    import Chat from '$lib/components/Chat.svelte'
    import Input from '$lib/components/Input.svelte'
    import Initialiser from '$lib/components/Initialiser.svelte'
    import Loader from '$lib/components/Loader.svelte'
    import Tree from '$lib/components/Tree.svelte'
    import PromptEditor from '$lib/components/PromptEditor.svelte'
    import ScreenCover from '$lib/components/ScreenCover.svelte'
    import FaviconChanger from '$lib/components/FaviconChanger.svelte'

    const title = $derived($messages.length > 1 ? $messages[1].content : 'Plump GPT'),
          blur  = $derived($loader_active || $tree_active || $prompt_editor_active)
    
    let header,
        chat,
        input

    const focusInput            = () => input.focus()
    const sendImmediately       = () => input.sendMessage()
    const quoteSelectedText     = () => input.quoteSelectedText()
    const chatModified          = () => input.chatLoaded()
    const regenerateReply       = () => input.regenerateReply()
    const addReply              = () => input.addReply()
    const saveChat              = () => header.saveChat()
    const sendingMessage        = () => chat.sendingMessage()
    const cancelProvisionalFork = () => chat.cancelProvisionalFork()

    const setInputText = (text) => {
        input.setText(text)
    }

    const scrollChatToBottom = (e) => {
        chat.scrollToBottom({ context: e.detail?.context })
    }

    const chatLoaded = () => {
        input.chatLoaded({ switch_model: true })
        chat.renderActiveHighlights()
        setTimeout(() => { chat.scrollToBottom({ context: 'chat_loaded' }) }, 250) // allow forks to load
    }

    const goToMessage = (message_id) => {
        chat.goToMessage({ message_id, delay: 50 })
        input.chatLoaded({ switch_model: true })
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='plump-gpt' class:blur={blur}>
    <Header
        bind:this={header}
        onClickTreeButton={cancelProvisionalFork}
    />
    <Chat
        bind:this={chat}
        on:chatModified={chatModified}
        on:quoteSelectedText={quoteSelectedText}
        on:regenerateReply={regenerateReply}
        on:addReply={addReply}
        on:saveChat={saveChat}
    />
    <Input
        bind:this={input}
        on:sendingMessage={sendingMessage}
        on:scrollChatToBottom={scrollChatToBottom}
        on:saveChat={saveChat}
    />
</main>

<Initialiser
    sendImmediately={sendImmediately}
    setInputText={setInputText}
    onReady={focusInput}
/>

{#if $loader_active}
    <Loader
        on:chatLoaded={chatLoaded}
    />
{/if}

{#if $tree_active}
    <Tree
        onClickNode={goToMessage}
    />
{/if}

{#if $prompt_editor_active}
    <PromptEditor/>
{/if}

<ScreenCover/>
<FaviconChanger/>

<style lang='sass'>
    +shared.globals

    .plump-gpt
        display:          flex
        flex-flow:        column nowrap
        height:           100vh
        min-width:        breakpoint.$cover-at-width
        box-sizing:       border-box
        background-color: $background-500
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
