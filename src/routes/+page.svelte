<script>
    import { main_menu_active, tree_active, loader_active, prompt_editor_active } from '$lib/stores/app'
    import { messages } from '$lib/stores/chat'

    import Header from '$lib/components/Header.svelte'
    import Chat from '$lib/components/Chat.svelte'
    import Input from '$lib/components/Input.svelte'
    import Initialiser from '$lib/components/Initialiser.svelte'
    import MainMenu from '$lib/components/MainMenu.svelte'
    import Loader from '$lib/components/Loader.svelte'
    import Tree from '$lib/components/Tree.svelte'
    import PromptEditor from '$lib/components/PromptEditor.svelte'
    import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte'
    import ScreenCover from '$lib/components/ScreenCover.svelte'
    import FaviconChanger from '$lib/components/FaviconChanger.svelte'

    let header = $state(null), // component references (nb: not reactive, but svelte 5 compiler sees them passed as props, so expects $state)
        chat   = $state(null),
        input  = $state(null)

    const title = $derived($messages.length > 1 ? $messages[1].content : 'Plump GPT'),
          blur  = $derived($loader_active || $tree_active || $prompt_editor_active)

    const saveChat           = () => header.saveChat(),
          scrollChatToBottom = (options) => chat.scrollToBottom(options),
          cancelFork         = () => chat.cancelFork(),
          focusInput         = () => input.focus(),
          setInputText       = (text) => input.setText(text),
          sendMessage        = () => input.sendMessage(),
          addReply           = () => input.addReply(),
          regenerateReply    = () => input.regenerateReply(),
          quoteSelectedText  = () => input.quoteSelectedText(),
          deleteChat         = () => input.deleteChat(),
          newChat            = () => input.newChat(),
          onChatUpdated      = () => input.onChatUpdated()

    const onChatLoaded = () => {
        input.onChatUpdated({ switch_model: true })
        chat.renderActiveHighlights()

        // allow forks to load
        setTimeout(() => {
            chat.scrollToBottom({ context: 'chat_loaded' })
        }, 250)
    }

    const goToMessage = (message_id) => {
        chat.goToMessage({ message_id, delay: 50 })
        input.onChatUpdated({ switch_model: true })
    }
</script>

<svelte:head>
    <title>{title}</title>
    <link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css'>
</svelte:head>

<main class='plump-gpt' class:blur={blur}>
    <Header
        bind:this={header}
        cancelFork={cancelFork}
    />
    <Chat
        bind:this={chat}
        saveChat={saveChat}
        deleteChat={deleteChat}
        addReply={addReply}
        regenerateReply={regenerateReply}
        quoteSelectedText={quoteSelectedText}
        onChatUpdated={onChatUpdated}
    />
    <Input
        bind:this={input}
        saveChat={saveChat}
        scrollChatToBottom={scrollChatToBottom}
    />
</main>

<Initialiser
    setInputText={setInputText}
    sendMessage={sendMessage}
    onReady={focusInput}
/>

{#if $main_menu_active}
    <MainMenu
        deleteChat={deleteChat}
        newChat={newChat}
    />
{/if}

{#if $loader_active}
    <Loader
        focusInput={focusInput}
        onChatLoaded={onChatLoaded}
    />
{/if}

{#if $tree_active}
    <Tree
        onClickNode={goToMessage}
    />
{/if}

{#if $prompt_editor_active}
    <PromptEditor
        focusInput={focusInput}
    />
{/if}

<KeyboardShortcuts
    header={header}
    chat={chat}
    input={input}
/>

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
