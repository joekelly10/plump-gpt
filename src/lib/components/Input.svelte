<script>
    import { tick, createEventDispatcher } from 'svelte'
    import { page } from '$app/stores'
    import { loader_active, prompt_editor_active, config } from '$lib/stores/app'
    import { chat_id, messages, forks, active_fork, active_messages, stars, highlights } from '$lib/stores/chat'
    import { is_hovering, is_adding_reply, is_scrolled_to_bottom } from '$lib/stores/chat/interactions'
    import { model, temperature, top_p } from '$lib/stores/ai'
    import { api_state, is_idle } from '$lib/stores/api'
    import { addCopyButtons } from '$lib/utils/helpers'
    import hljs from 'highlight.js'

    import ExpandButton from '$lib/components/Input/ExpandButton.svelte'
    import TreeButton from '$lib/components/Input/TreeButton.svelte'
    import SystemPromptButton from '$lib/components/Input/SystemPromptButton.svelte'
    import ScrollDownButton from '$lib/components/Input/ScrollDownButton.svelte'

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

    export const quoteSelectedText = () => {
        let selection = window.getSelection()

        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const selected_text = selection.toString().trim()
            if (!selected_text) return
            
            const quoted_text = selected_text.split('\n').map(line => `> ${line}`).join('\n'),
                  range       = selection.getRangeAt(0),
                  is_in_input = input.contains(range.commonAncestorContainer)
            
            if (is_in_input) {
                document.execCommand('insertText', false, quoted_text)
            } else {
                input.focus()

                const new_range = document.createRange()
                new_range.selectNodeContents(input)
                new_range.collapse(false)
                selection.removeAllRanges()
                selection.addRange(new_range)

                if (input_text && input_text.trim().length > 0) {
                    if (input_text.slice(-2) === '\n\n') {
                        document.execCommand('insertText', false, quoted_text + '\n\n')
                    } else if (input_text.slice(-1) === '\n') {
                        document.execCommand('insertText', false, '\n' + quoted_text + '\n\n')
                    } else {
                        document.execCommand('insertText', false, '\n\n' + quoted_text + '\n\n')
                    }
                } else {
                    document.execCommand('insertText', false, quoted_text + '\n\n')
                }
            }

            input.scrollTop = input.scrollHeight
        }
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

        api_state.startSending()

        await tick()
        hljs.highlightAll()
        clearIsHovering()
        dispatch('scrollChatToBottom', { context: 'sending_message' })

        const options = $model.is_reasoner ? {
            model: $model.id
        } : {
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
            id:                 getNextId(),
            parent_id:          getParentId(),
            role:               'assistant',
            reasoning_content:  '',
            reasoning_finished: false,
            content:            '',
            timestamp:          '',
            model:              $model,
            temperature:        $temperature,
            top_p:              $top_p,
            usage:              {
                cache_write_tokens: 0,
                cache_read_tokens:  0,
                input_tokens:       0,
                output_tokens:      0
            }
        }

        api_state.startStreaming()

        $forks[$active_fork].message_ids.push(gpt_message.id)
        $forks = $forks

        $messages = [...$messages, gpt_message]

        await tick()
        dispatch('scrollChatToBottom', { context: 'streaming_started' })

        const decoder = new TextDecoderStream()
        const reader  = response.body.pipeThrough(decoder).getReader()
        await streamGPTResponse(reader, gpt_message)

        console.log(`🤖-✅ ${$model.short_name} replied: `, gpt_message.content)

        api_state.finishStreaming()
        $is_adding_reply = false
        hljs.highlightAll()
        addCopyButtons()

        await tick()
        dispatch('scrollChatToBottom', { context: 'streaming_finished' })

        if ($config.autosave) dispatch('save')
    }

    const streamGPTResponse = async (reader, gpt_message) => {
        let buffer      = '',
            brace_count = 0

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
                        if (['open-ai', 'x', 'mistral', 'openrouter', 'ai21'].includes($model.type)) {
                            await processOpenAIObject(data, gpt_message)
                        } else if ($model.type === 'anthropic') {
                            await processAnthropicObject(data, gpt_message)
                        } else if ($model.type === 'google') {
                            await processGoogleObject(data, gpt_message)
                        } else if ($model.type === 'deepseek') {
                            await processDeepSeekObject(data, gpt_message)
                        } else if ($model.type === 'groq') {
                            await processGroqObject(data, gpt_message)
                        } else if ($model.type === 'cohere') {
                            await processCohereObject(data, gpt_message)
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

            if (!rate_limiter) {
                dispatch('scrollChatToBottom', { context: 'streaming_message' })
                rate_limiter = setTimeout(() => { rate_limiter = null }, 200)
            }
        }

        gpt_message.timestamp = new Date().toISOString()
        $messages = [...$messages.slice(0,-1), gpt_message]
    }

    const processOpenAIObject = async (data, gpt_message) => {
        const content = data.choices[0]?.delta.content ?? ''
        await append(gpt_message, content)
        if (data.usage) {
            const cache_read_tokens = data.usage.prompt_tokens_details?.cached_tokens ?? 0
            gpt_message.usage.cache_read_tokens = cache_read_tokens
            gpt_message.usage.input_tokens      = data.usage.prompt_tokens - cache_read_tokens
            gpt_message.usage.output_tokens     = data.usage.completion_tokens
        }
    }

    const processAnthropicObject = async (data, gpt_message) => {
        if (data.type === 'content_block_delta') {
            const text = data.delta.text ?? ''
            await append(gpt_message, text)
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
    }

    const processGoogleObject = async (data, gpt_message) => {
        if (data.error) {
            console.log('🤖-❌ Error:', data.error)
            gpt_message.content += `\n\n**🚨 Error: ${data.error.message}**`
        } else {
            const text = data.candidates[0].content.parts[0].text ?? ''
            await append(gpt_message, text, { speed_limit: 8 })
            gpt_message.usage.input_tokens = data.usageMetadata.promptTokenCount
            gpt_message.usage.output_tokens = data.usageMetadata.candidatesTokenCount
        }
    }

    const processDeepSeekObject = async (data, gpt_message) => {
        const reasoning_content = data.choices[0]?.delta.reasoning_content ?? '',
              content           = data.choices[0]?.delta.content ?? ''
        await append(gpt_message, reasoning_content, { is_reasoning: true })
        await append(gpt_message, content)
        if (data.usage) {
            const cache_read_tokens = data.usage.prompt_tokens_details?.cached_tokens ?? 0
            gpt_message.usage.cache_read_tokens = cache_read_tokens
            gpt_message.usage.input_tokens      = data.usage.prompt_tokens - cache_read_tokens
            gpt_message.usage.output_tokens     = data.usage.completion_tokens
        }
    }

    const processGroqObject = async (data, gpt_message) => {
        const content = data.choices[0]?.delta.content ?? ''
        if ($model.is_reasoner) {
            if (gpt_message.reasoning_finished) {
                await append(gpt_message, content, { speed_limit: 4 })
            } else if (content === '<think>') {
                gpt_message.reasoning_content = ''
            } else if (content === '</think>') {
                gpt_message.reasoning_finished = true
            } else {
                await append(gpt_message, content, { is_reasoning: true, speed_limit: 2 })
            }
        } else {
            await append(gpt_message, content, { speed_limit: 4 })
        }
        if (data.usage) {
            const cache_read_tokens = data.usage.prompt_tokens_details?.cached_tokens ?? 0
            gpt_message.usage.cache_read_tokens = cache_read_tokens
            gpt_message.usage.input_tokens      = data.usage.prompt_tokens - cache_read_tokens
            gpt_message.usage.output_tokens     = data.usage.completion_tokens
        }
    }

    const processCohereObject = async (data, gpt_message) => {
        if (data.type === 'content-delta') {
            const content = data.delta.message.content.text ?? ''
            await append(gpt_message, content)
        } else if (data.type === 'message-end') {
            gpt_message.usage.input_tokens = data.delta.usage.billed_units.input_tokens
            gpt_message.usage.output_tokens = data.delta.usage.billed_units.output_tokens
        }
    }

    const append = async(gpt_message, new_text, options = { is_reasoning: false, speed_limit: 10 }) => {
        if (!new_text) return
        if ($config.smooth_output) {
            //  Smooth out + speed limit the API output stream for a nicer UX.
            //  The Google API in particular bazookas out fat chunks of text at a time,
            //  which in terms of UX is a formidable scent that stings the nostrils.
            const words = new_text.split(/(\s+)/)
            for (const word of words) {
                if (options.is_reasoning) {
                    gpt_message.reasoning_content += word
                } else {
                    gpt_message.content += word
                }
                $messages = [...$messages.slice(0, -1), gpt_message]
                await tick()
                hljs.highlightAll()
                await new Promise(resolve => setTimeout(resolve, options.speed_limit))
            }
        } else {
            if (options.is_reasoning) {
                gpt_message.reasoning_content += new_text
            } else {
                gpt_message.content += new_text
            }
            $messages = [...$messages.slice(0, -1), gpt_message]
            await tick()
            hljs.highlightAll()
        }
    }

    const inputChanged = () => {
        input_overflowed = input_expanded || input.scrollHeight > input.clientHeight
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

    const formatSelectedText = (format_type) => {
        const selection = window.getSelection()
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const selected_text = selection.toString().trim()
            if (!selected_text) return
            if (format_type === 'bold') {
                if (selected_text.startsWith('**') && selected_text.endsWith('**') && selected_text.length >= 4) {
                    const unformatted_text = selected_text.substring(2, selected_text.length - 2)
                    document.execCommand('insertText', false, unformatted_text)
                } else {
                    const bold_text = `**${selected_text}**`
                    document.execCommand('insertText', false, bold_text)
                }
            } else if (format_type === 'italic') {
                if (selected_text.startsWith('_') && selected_text.endsWith('_') && selected_text.length >= 2) {
                    const unformatted_text = selected_text.substring(1, selected_text.length - 1)
                    document.execCommand('insertText', false, unformatted_text)
                } else {
                    const italic_text = `_${selected_text}_`
                    document.execCommand('insertText', false, italic_text)
                }
            }
        }
    }

    const keydownMessageInput = (e) => {
        if ($loader_active) {
            e.preventDefault()
            return
        }

        if (e.ctrlKey && e.shiftKey && e.key === 'ArrowUp') {
            e.preventDefault()
            return input_expanded = true
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'ArrowDown') {
            e.preventDefault()
            return input_expanded = false
        }

        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault()
            return formatSelectedText('bold')
        }

        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault()
            return formatSelectedText('italic')
        }

        if (e.key == 'Enter' && !e.shiftKey) {
            e.preventDefault()
            input_expanded = false
            if ($is_idle && input_text.trim().length) {
                return sendMessage()
            } else {
                return nope()
            }
        }
    }

    const keydownDocument = (e) => {
        if ($loader_active || $prompt_editor_active) return

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault()
            return openPromptEditor()
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === '.') {
            e.preventDefault()
            return quoteSelectedText()
        }

        if (e.metaKey && e.altKey && e.key === 'Backspace') {
            e.preventDefault()
            if ($chat_id && !$loader_active) return deleteChat()
        }

        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault()
            return newChat()
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
        $messages              = $messages.slice(0,1)
        $forks                 = [{ message_ids: [0], forked_at: [], provisional: false }]
        $active_fork           = 0
        $stars                 = []
        $highlights            = []
        $chat_id               = null
        $loader_active         = false
        $is_scrolled_to_bottom = true
        clearIsHovering()
        $page.url.searchParams.delete('user_message')
        window.history.replaceState(null, '', $page.url.toString())
        focus()
        await tick()
        console.log('🌱 New chat created.')
    }

    const clearIsHovering = () => {
        is_hovering.set({ delete: [], regenerate: [], add_reply: [], star: [] })
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
