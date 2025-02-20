<script>
    import hljs from 'highlight.js'
    import { tick, createEventDispatcher } from 'svelte'
    import { addCopyButtons } from '$lib/utils/helpers'
    import { chat_id, messages, forks, active_fork, stars, active_messages, loader_active, prompt_editor_active, config, adding_reply, show_scroll_button } from '$lib/stores/chat'
    import { model, temperature, top_p, api_status } from '$lib/stores/ai'
    import { page } from '$app/stores'
    import SystemPromptButton from '$lib/components/Input/SystemPromptButton.svelte'
    import ScrollDownButton from '$lib/components/Input/ScrollDownButton.svelte'
    import TreeButton from '$lib/components/Input/TreeButton.svelte'
    import ExpandButton from '$lib/components/Input/ExpandButton.svelte'

    const dispatch = createEventDispatcher()

    let input,
        input_text,
        rate_limiter,
        nope_timer
    
    let input_overflowed = false,
        input_expanded   = false,
        nope_highlight   = false

    export const focus = () => input.focus()

    export const setText = async (text) => {
        input_text = text
        await tick()

        //  move cursor to end of input
        let range = document.createRange()
        range.selectNodeContents(input)
        range.collapse(false)

        let selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

        await tick()
    }

    export const regenerateReply = async () => sendMessage(true)
    export const addReply        = async () => sendMessage(true)

    export const chatLoaded = async (options = {}) => {
        focus()
        await tick()
        hljs.highlightAll()
        addCopyButtons()
        if (options.switch_model) {
            const last_used_model = $active_messages[$active_messages.length - 1].model?.id
            if (last_used_model) model.setById(last_used_model)
        }
    }

    export const sendMessage = async (is_regeneration = false) => {
        console.log('🤖 Sending message...')

        const getNextId = () => {
            return $messages[$messages.length - 1].id + 1
        }

        const getParentId = () => {
            const message_ids = $forks[$active_fork].message_ids
            return message_ids[message_ids.length - 1]
        }

        if (!is_regeneration) {
            const user_message = {
                id:        getNextId(),
                parent_id: getParentId(),
                role:      'user',
                content:   input_text
            }
            input_text       = ''
            input_overflowed = false
            $messages        = [...$messages, user_message]
            $forks[$active_fork].message_ids.push(user_message.id)
            $forks[$active_fork].provisional = false
            dispatch('sendingMessage')
            $forks = $forks
        }

        $api_status = 'sending'

        await tick()
        hljs.highlightAll()
        dispatch('scrollChatToBottom', { context: 'sending_message' })

        const options = {
            model:       $model.id,
            temperature: $temperature,
            top_p:       $top_p
        }

        const response = await fetch(`/api/ai/chat/${$model.type}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $active_messages, options })
        })

        console.log(`🤖-⏳ ${$model.short_name} is replying...`)

        let gpt_message = {
            id:                getNextId(),
            parent_id:         getParentId(),
            role:              'assistant',
            reasoning_content: '',
            content:           '',
            timestamp:         '',
            model:             $model,
            temperature:       $temperature,
            top_p:             $top_p,
            usage:             {
                cache_write_tokens: 0,
                cache_read_tokens:  0,
                input_tokens:       0,
                output_tokens:      0
            }
        }

        $api_status = 'streaming'

        $forks[$active_fork].message_ids.push(gpt_message.id)
        $forks = $forks

        $messages = [...$messages, gpt_message]

        await tick()
        dispatch('scrollChatToBottom', { context: 'streaming_started' })

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()
        await streamGPTResponse(reader, gpt_message)

        console.log(`🤖-✅ ${$model.short_name} replied: `, gpt_message.content)

        $api_status   = 'idle'
        $adding_reply = false
        hljs.highlightAll()
        addCopyButtons()

        await tick()
        dispatch('scrollChatToBottom', { context: 'streaming_finished' })

        if ($config.autosave) dispatch('save')
    }

    const streamGPTResponse = async (reader, gpt_message) => {
        let buffer      = '',
            brace_count = 0

        const append = (new_text, is_reasoning = false) => {
            if (!new_text) return
            if (is_reasoning) {
                gpt_message.reasoning_content += new_text
            } else {
                gpt_message.content += new_text
            }
            $messages = [...$messages.slice(0, -1), gpt_message]
        }

        //  Smooth out (+ speed limit) the API output stream for a nicer UX.
        //  The Google API in particular bazookas out fat chunks of text at
        //  a time, which is a pungent scent that stings the nostrils.

        const smoothAppend = async (new_text, speed_limit = 8, is_reasoning = false) => {
            if (!new_text) return
            const words = new_text.split(/(\s+)/)
            for (const word of words) {
                if (is_reasoning) {
                    gpt_message.reasoning_content += word
                } else {
                    gpt_message.content += word
                }
                $messages = [...$messages.slice(0, -1), gpt_message]
                await new Promise(resolve => setTimeout(resolve, speed_limit))
            }
        }

        while (true) {
            const { value, done } = await reader.read()

            if (done) break
            buffer += value

            let start_index = buffer.indexOf('{')

            //  find JSON objects by counting curly braces;
            //  use quotes to distinguish structural braces
            //  from braces found inside strings

            while (start_index !== -1) {
                brace_count = 1

                let end_index = start_index + 1
                let in_string = false

                while (brace_count > 0 && end_index < buffer.length) {
                    if (buffer[end_index] === '"') {
                        if (buffer[end_index - 1] === '\\') {
                            let backslash_count = 0, i = end_index - 1
                            while (i >= 0 && buffer[i] === '\\') { backslash_count++; i-- }
                            if (backslash_count % 2 === 0) in_string = !in_string
                            //  ^^ handle edge case where string is an escaped
                            //  backslash, breaking the closing quote heuristic
                            //  e.g. { "delta": { "content": "\\" } }
                        } else {
                            in_string = !in_string
                        }
                    }
                    if (!in_string) {
                        if (buffer[end_index] === '{') brace_count++
                        if (buffer[end_index] === '}') brace_count--
                    }
                    end_index++
                }

                if (brace_count === 0) {
                    const json_string = buffer.slice(start_index, end_index)
                    try {
                        const data = JSON.parse(json_string)
                        if (['open-ai', 'x', 'llama', 'mistral', 'deepseek', 'openrouter'].includes($model.type)) {
                            if ($model.id === 'deepseek-reasoner') {
                                const reasoning_content = data.choices[0]?.delta.reasoning_content ?? ''
                                if (reasoning_content) {
                                    if ($config.smooth_output) {
                                        await smoothAppend(reasoning_content, 5, true)
                                    } else {
                                        append(reasoning_content, true)
                                    }
                                }
                            }
                            const content = data.choices[0]?.delta.content ?? ''
                            if ($config.smooth_output) {
                                await smoothAppend(content)
                            } else {
                                append(content)
                            }
                            if (data.usage) {
                                const cache_read_tokens = data.usage.prompt_tokens_details?.cached_tokens ?? 0
                                gpt_message.usage.cache_read_tokens = cache_read_tokens
                                gpt_message.usage.input_tokens      = data.usage.prompt_tokens - cache_read_tokens
                                gpt_message.usage.output_tokens     = data.usage.completion_tokens
                            }
                        } else if ($model.type === 'anthropic') {
                            if (data.type === 'content_block_delta') {
                                const text = data.delta.text ?? ''
                                if ($config.smooth_output) {
                                    await smoothAppend(text)
                                } else {
                                    append(text)
                                }
                            } else if (data.type === 'message_start') {
                                gpt_message.usage.cache_write_tokens = data.message.usage.cache_creation_input_tokens ?? 0
                                gpt_message.usage.cache_read_tokens  = data.message.usage.cache_read_input_tokens ?? 0
                                gpt_message.usage.input_tokens       = data.message.usage.input_tokens
                            } else if (data.type === 'message_delta') {
                                gpt_message.usage.output_tokens = data.usage.output_tokens
                            } else if (data.type === 'error') {
                                console.log('🤖-❌ Error: ', data)
                                gpt_message.content += `\n\n**🚨 Error: ${data.error.message}**`
                            }
                        } else if ($model.type === 'google') {
                            if (data.error) {
                                console.log('🤖-❌ Error:', data.error)
                                gpt_message.content += `\n\n**🚨 Error: ${data.error.message}**`
                            } else {
                                const text = data.candidates[0].content.parts[0].text ?? ''
                                if ($config.smooth_output) {
                                    await smoothAppend(text)
                                } else {
                                    append(text)
                                }
                                gpt_message.usage.input_tokens = data.usageMetadata.promptTokenCount
                                gpt_message.usage.output_tokens = data.usageMetadata.candidatesTokenCount
                            }
                        } else if ($model.type === 'cohere') {
                            if (data.type === 'content-delta') {
                                const content = data.delta.message.content.text ?? ''
                                if ($config.smooth_output) {
                                    await smoothAppend(content)
                                } else {
                                    append(content)
                                }
                            } else if (data.type === 'message-end') {
                                gpt_message.usage.input_tokens = data.delta.usage.billed_units.input_tokens
                                gpt_message.usage.output_tokens = data.delta.usage.billed_units.output_tokens
                            }
                        }
                    } catch {
                        console.log('❌ Error parsing json: ', json_string)
                    }
                    buffer = buffer.slice(end_index + 1)
                    start_index = buffer.indexOf('{')
                } else {
                    //  incomplete JSON object - need to wait for more data
                    break
                }
            }

            $messages = [...$messages.slice(0,-1), gpt_message]

            if (!rate_limiter) {
                await tick()
                dispatch('scrollChatToBottom', { context: 'streaming_message' })
                rate_limiter = setTimeout(() => { rate_limiter = null }, 200)
            }
        }

        gpt_message.timestamp = new Date().toISOString()
        
        //  usage is not sent in the event stream for Llama
        if ($model.type === 'llama') gpt_message.usage = await getUsage()

        $messages = [...$messages.slice(0,-1), gpt_message]
    }

    const getUsage = async () => {
        const response = await fetch(`/api/ai/usage/${$model.type}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ messages: $active_messages })
        })

        return await response.json()
    }

    const inputChanged = () => {
        input_overflowed = input.scrollHeight > input.clientHeight
    }

    const pastedInput = (e) => {
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        const range = window.getSelection().getRangeAt(0)
        const el    = range.startContainer.parentElement
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }

    const nope = () => {
        clearTimeout(nope_timer)
        nope_highlight = true
        nope_timer     = setTimeout(() => { nope_highlight = false}, 50)
    }

    const keydownMessageInput = (e) => {
        if ($loader_active) {
            e.preventDefault()
            return
        }
        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            input_expanded = false
            if ($api_status === 'idle' && input_text.trim().length) {
                sendMessage()
            } else {
                nope()
            }
        }
    }

    const keydownDocument = (e) => {
        if ($loader_active || $prompt_editor_active) return

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault()
            return openPromptEditor()
        }

        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault()
            return newChat()
        }
        if (e.metaKey && e.altKey && e.key === 'Backspace') {
            e.preventDefault()
            if ($chat_id && !$loader_active) return deleteChat()
        }
    }

    const openPromptEditor = () => {
        $prompt_editor_active = true
    }

    const deleteChat = async () => {
        if (confirm('Delete current chat?  Press OK to confirm.')) {
            console.log(`🗑️ Deleting chat: ${$chat_id}...`)
            const response = await fetch(`/api/chats/${$chat_id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            if (response.ok) {
                console.log(`🗑️–✅ Chat deleted.`)
                newChat()
            } else {
                console.log(`🗑️–❌ Delete failed: ${response.status} ${response.statusText}`)
                const json = await response.json()
                if (json) console.log(json)
            }
        }
    }

    const newChat = async () => {
        $messages           = $messages.slice(0,1)
        $forks              = [{ message_ids: [0], forked_at: [], provisional: false }]
        $active_fork        = 0
        $stars              = []
        $chat_id            = null
        $loader_active      = false
        $show_scroll_button = false
        $page.url.searchParams.delete('user_message')
        window.history.replaceState(null, '', $page.url.toString())
        focus()
        await fetchAndSetActivePrompt()
        await tick()
    }
</script>

<svelte:document on:keydown={keydownDocument} />

<section class='user-input' class:expanded={input_expanded}>
    <ExpandButton
        bind:input_expanded={input_expanded}
        input_overflowed={input_overflowed}
    />

    <div class='container' class:nope-highlight={nope_highlight}>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class='input'
            contenteditable='true'
            bind:this={input}
            bind:innerText={input_text}
            on:keydown={keydownMessageInput}
            on:paste|preventDefault={pastedInput}
            on:input={inputChanged}
        ></div>
    </div>

    {#if !input_expanded}
        <TreeButton/>
        <SystemPromptButton/>
        <ScrollDownButton
            on:clicked={() => dispatch('scrollChatToBottom', { context: 'scroll_down_button' })}
        />
    {/if}
</section>

<style lang='sass'>
    .user-input
        flex-grow:        0
        position:         relative
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding 0
        background-color: $background-darker
        user-select:      none

        &.expanded
            .input
                min-height: 80vh
                max-height: 80vh
                transition: min-height easing.$quart-out 300ms, max-height easing.$quart-out 300ms
    
    .container
        position:         relative
        z-index:          10
        margin:           0 auto
        width:            720px
        box-sizing:       border-box
        padding:          16px
        border:           1px solid $blue-grey
        border-radius:    12px
        background-color: $background-lighter
        transition:       box-shadow easing.$quart-out 500ms, border-color easing.$quart-out 500ms

        &.nope-highlight
            box-shadow:   0 0 0 1px $coral, 0 0 0 1px $coral inset
            border-color: $coral
            transition:   none
    
    .input
        position:      relative
        z-index:       1
        margin:        0 auto
        width:         100%
        min-height:    0px
        max-height:    192px
        box-sizing:    border-box
        padding-right: 16px
        line-height:   font.$line-height-paragraph
        text-align:    left
        font-family:   font.$sans-serif
        font-size:     16px
        font-weight:   400
        color:         white
        caret-color:   $blue
        text-wrap:     wrap
        resize:        none
        overflow:      overlay
        transition:    min-height easing.$quart-out 600ms, max-height easing.$quart-out 300ms

        &::-webkit-scrollbar
            width:      8px
            height:     8px
            background: transparent
        
        &::-webkit-scrollbar-thumb
            background:    white
            border-radius: 99px
</style>
