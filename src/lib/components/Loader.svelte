<script>
    import { onMount, onDestroy, tick } from 'svelte'
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { loader_active } from '$lib/stores/app'
    import { chat_id, messages, forks, active_fork, stars, highlights } from '$lib/stores/chat'
    import { is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { migrateIfNeeded } from '$lib/utils/migrate'
    import { smoothScroll } from '$lib/utils/helpers'
    import hljs from 'highlight.js'

    import Search from '$lib/components/Loader/Search.svelte'
    import LoaderChat from '$lib/components/Loader/LoaderChat.svelte'
    import PageControls from '$lib/components/Loader/PageControls.svelte'

    const { focusInput, onChatLoaded } = $props()

    let search,
        scrolling_div

    let filter         = $state('all'),
        search_value   = $state(''),
        searched_value = $state(''),
        chats          = $state([]),
        total_chats    = $state(0),
        total_pages    = $state(0),
        active_page    = $state(1),
        keyboard_index = $state(null),
        suspend_mouse  = $state(false)

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

    const mousemove = () => {
        suspend_mouse = false
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

            chats          = migrateIfNeeded(json.items)
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
        onChatLoaded()
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

    const close = () => {
        $loader_active = false
        focusInput()
    }
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
            fetchChats={fetchChats}
            nextPage={nextPage}
            prevPage={prevPage}
            close={close}
        />

        <div class='chats'>
            {#each chats as chat, i (chat.id)}
                <LoaderChat
                    chat={chat}
                    index={i}
                    keyboard_index={keyboard_index}
                    suspend_mouse={suspend_mouse}
                    loadChat={loadChat}
                    deleteChat={deleteChat}
                />
            {/each}
            {#if filter === 'all' && chats.length === 0}
                <div class='no-chats'>
                    You haven't started any chats yet!
                </div>
            {/if}
        </div>

        {#if chats.length}
            <PageControls
                active_page={active_page}
                total_pages={total_pages}
                prevPage={prevPage}
                nextPage={nextPage}
            />
        {/if}
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
        background-color: color.adjust($background-700, $alpha: -0.125)
    
    .inner
        position:       relative
        height:         100%
        box-sizing:     border-box
        padding-bottom: 3 * space.$default-padding
        overflow-y:     scroll
        +shared.scrollbar

    .chats
        // don't use flexbox here, it messes up delete animations
        margin:         0 auto
        padding-bottom: 2 * space.$default-padding
        width:          800px

        .no-chats
            padding-top: 192px
            text-align:  center
            font-weight: 450
            color:       $background-200
</style>
