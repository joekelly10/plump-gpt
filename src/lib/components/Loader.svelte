<script>
    import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { loader_active } from '$lib/stores/app'
    import { chat_id, messages, forks, active_fork, stars, highlights } from '$lib/stores/chat'
    import { is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { smoothScroll } from '$lib/utils/helpers'
    import hljs from 'highlight.js'

    import Search from '$lib/components/Loader/Search.svelte'
    import LoaderChat from '$lib/components/Loader/LoaderChat.svelte'
    
    const dispatch = createEventDispatcher()
    
    let filter         = 'all',
        chats          = [],
        keyboard_index = null,
        total_chats    = 0,
        total_pages    = 0,
        active_page    = 1,
        suspend_mouse  = false,
        scrolling_div  = null
    
    let search,
        search_value,
        searched_value

    const close = () => $loader_active = false

    const keydown = (e) => {
        if (e.key === 'Escape') return close()
        if (e.key === 'Enter') return keyboardSelect()

        if (search.is_focused()) {
            if (e.key === 'ArrowDown') {
                search.unfocus()
                return nextItem()
            }
            return
        }

        e.preventDefault()

        if (e.key === 'ArrowUp') return prevItem()
        if (e.key === 'ArrowDown') return nextItem()
        if (e.key === 'ArrowLeft') return prevPage()
        if (e.key === 'ArrowRight') return nextPage()
        if (e.metaKey && e.key === 'Backspace') return keyboardDelete()
    }

    const fetchChats = async () => {
        let url
        if (search_value) {
            console.log('\n📂 + 🔍 Fetching chats w/ search term:', search_value)
            url = `/api/chats/search?query=${encodeURIComponent(search_value)}&filter=${filter}&page=${active_page}&per_page=10`
        } else {
            console.log('\n📂 Fetching chats...')
            url = `/api/chats?filter=${filter}&page=${active_page}&per_page=10`
        }

        chats = []

        const response = await fetch(url, {
            method:  'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
            const json = await response.json()

            chats          = json.items
            total_chats    = json.total_items
            total_pages    = json.total_pages
            searched_value = search_value

            await tick()
            hljs.highlightAll()
            console.log(`📂–✅ Fetched ${json.items.length} items.`)
        } else {
            console.log(`📂–❌ Fetch chats failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }

    const nextPage = async () => {
        if (!(active_page < total_pages)) return

        keyboard_index  = null
        suspend_mouse   = true
        active_page    += 1

        await tick()
        smoothScroll(scrolling_div, 0, 333, 'quartOut')
        await fetchChats()
    }

    const prevPage = async () => {
        if (active_page === 1) return

        keyboard_index  = null
        suspend_mouse   = true
        active_page    -= 1

        await tick()
        smoothScroll(scrolling_div, 0, 333, 'quartOut')
        await fetchChats()
    }

    const prevItem = async () => {
        suspend_mouse = true

        if (keyboard_index === 0) {
            keyboard_index = null
            search.focus()
            await tick()
            smoothScroll(scrolling_div, 0, 333, 'quartOut')
            return
        }

        if (keyboard_index === null) {
            keyboard_index = 0
        } else {
            keyboard_index -= 1
        }

        await tick()
        scrollToHighlighted()
    }

    const nextItem = async () => {
        suspend_mouse = true

        if (keyboard_index === chats.length - 1) return

        if (keyboard_index === null) {
            keyboard_index = 0
        } else {
            keyboard_index += 1
        }

        await tick()
        scrollToHighlighted()
    }

    const scrollToHighlighted = () => {
        const highlighted = document.querySelector('.keyboard-highlight')
        if (!highlighted) return
        const container_rect = scrolling_div.getBoundingClientRect(),
              element_rect   = highlighted.getBoundingClientRect(),
              target         = element_rect.top - container_rect.top + scrolling_div.scrollTop - 120
        smoothScroll(scrolling_div, target, 333, 'quartOut')
    }

    const keyboardSelect = async () => {
        if (keyboard_index === null && chats.length) {
            keyboard_index = 0
            await tick()
        }
        chats[keyboard_index].selected = true
        setTimeout(() => { loadChat(chats[keyboard_index]) }, 50)
    }

    const loadChat = async (chat) => {
        // temp hack
        migrateIfNeeded(chat)

        await unload() // reset all stores (to prevent out of range errors)

        // allow time for the unpainting of highlights (tick doesn't work here)
        await new Promise(resolve => setTimeout(resolve, 10))

        $messages    = chat.messages
        $forks       = chat.forks
        $active_fork = chat.active_fork
        $stars       = chat.stars
        $highlights  = chat.highlights
        $chat_id     = chat.id

        await tick()
        close()
        dispatch('chatLoaded')
    }

    const unload = async () => {
        //  the order here is important
        $highlights               = []
        $stars                    = []
        $active_fork              = 0
        $forks                    = [{ message_ids: [0], forked_at: [], provisional: false }]
        $messages                 = $messages.slice(0,1)
        $chat_id                  = null
        $is_provisionally_forking = false
        await tick()
    }

    const migrateIfNeeded = (chat) => {
        chat.messages.forEach(message => {
            // usage is missing from old chats
            if (message.role === 'assistant' && !message.usage) {
                if (message.model.startsWith('claude')) {
                    message.model = {
                        type:           'anthropic',
                        id:             'claude-3-5-sonnet-20240620',
                        name:           'Claude 3.5 Sonnet',
                        short_name:     'Claude',
                        icon:           'claude-3-sonnet.png',
                        context_window: 200000
                    }
                } else {
                    message.model = {
                        type:           'open-ai',
                        id:             'gpt-4o-2024-08-06',
                        name:           'GPT-4o',
                        short_name:     'GPT-4o',
                        icon:           'gpt-4o.png',
                        context_window: 128000
                    }
                }
                message.temperature = 0.4
                message.top_p = 1
                message.usage = {
                    cache_write_tokens: 0,
                    cache_read_tokens:  0,
                    input_tokens:       0,
                    output_tokens:      0
                }
                message.timestamp = new Date(chat.updatedAt).toISOString()
            }
            // cache_write_tokens and cache_read_tokens are missing from old usage objects
            if (message.role === 'assistant' && message.usage.cache_write_tokens === undefined) {
                message.usage = {
                    ...message.usage,
                    cache_write_tokens: 0,
                    cache_read_tokens:  0
                }
            }
        })
        // stars are missing from old chats
        if (!chat.stars) chat.stars = []
        // highlights are missing from old chats
        if (!chat.highlights) chat.highlights = []
    }

    const deleteChat = async (chat) => {
        const confirmed = await confirmDelete(chat)

        if (confirmed) {
            console.log(`🗑️ Deleting chat: ${chat.id}...`)

            const response = await fetch(`/api/chats/${chat.id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                console.log(`🗑️–✅ Chat deleted.`)

                if (chat.id === $chat_id) {
                    $messages    = $messages.slice(0,1)
                    $forks       = [{ message_ids: [0], forked_at: [], provisional: false }]
                    $active_fork = 0
                    $chat_id     = null
                }

                chats = chats.filter(c => c.id !== chat.id)

                if (!chats.length) {
                    keyboard_index = null
                    await fetchChats()
                }

                if (keyboard_index > chats.length - 1) keyboard_index = chats.length - 1
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        } else {
            chats[keyboard_index].selected = false
            chats[keyboard_index].deleting = false
        }
    }

    const confirmDelete = async (chat) => {
        let excerpt

        if (chat.messages[1].content.length < 100) {
            excerpt = '“' + chat.messages[1].content + '”'
        } else {
            excerpt = '“' + chat.messages[1].content.substring(0,99) + '...”'
        }

        return new Promise((resolve) => {
            resolve(confirm(`Delete chat?\n\n${excerpt}\n\nPress OK to confirm.`))
        })
    }

    const keyboardDelete = async () => {
        chats[keyboard_index].selected = true
        chats[keyboard_index].deleting = true

        //  for some reason `await tick()` doesn't work here... 🤷‍♂️
        await new Promise(resolve => setTimeout(resolve, 50))

        await deleteChat(chats[keyboard_index])
        scrollToHighlighted()
    }

    const mousemove = () => suspend_mouse = false

    onMount(() => {
        document.addEventListener('keydown', keydown)
        document.addEventListener('mousemove', mousemove)
        fetchChats()
        search.focus()
        search.clear_timer() // prevents search from being triggered on load
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
        document.removeEventListener('mousemove', mousemove)
    })
</script>

<div class='loader' in:scale={{ start: 1.02, opacity: 0, duration: 200, easing: quartOut }} out:scale={{ start: 1.02, opacity: 0, duration: 100, easing: quartOut }}>
    <div bind:this={scrolling_div} class='inner'>
        <Search
            bind:this={search}
            bind:search_value={search_value}
            bind:searched_value={searched_value}
            bind:filter={filter}
            bind:active_page={active_page}
            total_chats={total_chats}
            total_pages={total_pages}
            on:fetchChats={fetchChats}
            on:nextPage={nextPage}
            on:prevPage={prevPage}
            on:close={close}
        />

        <div class='chats'>
            {#each chats as chat, i (chat.id)}
                <LoaderChat
                    chat={chat}
                    index={i}
                    keyboard_index={keyboard_index}
                    suspend_mouse={suspend_mouse}
                    on:loadChat={(event) => { loadChat(event.detail.chat) }}
                    on:deleteChat={(event) => { deleteChat(event.detail.chat) }}
                />
            {/each}
        </div>
    </div>
</div>

<style lang='sass'>
    .loader
        position:         fixed
        top:              0
        left:             0
        z-index:          99
        width:            100vw
        height:           100vh
        background-color: color.adjust($background-darker, $alpha: -0.125)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 128px
        overflow-y:     scroll
        +shared.scrollbar

    .chats
        margin: 0 auto
        width:  800px
</style>
