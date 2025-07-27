<script>
    import { loader_active, prompt_editor_active, tree_active, model_list_active, tool_list_active, user_settings_active, input_expanded } from '$lib/stores/app'
    import { forks, active_fork, chat_id } from '$lib/stores/chat'
    import { model, temperature, top_p } from '$lib/stores/ai'
    import { is_idle } from '$lib/stores/api'

    let { header, chat, input } = $props()

    let uparrow_limiter,
        downarrow_limiter

    const onkeydown = (e) => {
        if ($loader_active || $prompt_editor_active || $tree_active) return

        // scroll
        if (e.shiftKey && e.altKey && e.key === 'ArrowDown') {
            return chat.scrollToBottom({ context: 'keyboard_shortcut' })
        }
        if (e.shiftKey && e.altKey && e.key === 'ArrowUp') {
            return chat.scrollToTop()
        }
        if (e.altKey && e.key === 'ArrowDown') {
            if (downarrow_limiter) return
            downarrow_limiter = setTimeout(() => { downarrow_limiter = null }, 50)
            return chat.scrollDown()
        }
        if (e.altKey && e.key === 'ArrowUp') {
            if (uparrow_limiter) return
            uparrow_limiter = setTimeout(() => { uparrow_limiter = null }, 50)
            return chat.scrollUp()
        }

        // new chat
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault()
            return input.newChat()
        }

        // delete
        if (e.metaKey && e.altKey && e.key === 'Backspace') {
            e.preventDefault()
            if ($chat_id && !$loader_active) {
                if (confirm('Delete current chat?  Press OK to confirm.')) {
                    return input.deleteChat()
                }
            }
        }

        // load + save
        if ((e.ctrlKey && e.key === 'o') || (e.metaKey && e.key === 'o')) {
            e.preventDefault()
            if ($is_idle) {
                $loader_active = !$loader_active
                return
            }
        }
        if ((e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's')) {
            e.preventDefault()
            return header.saveChat()
        }

        // model
        if (e.shiftKey && e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.prev()
            return
        }
        if (e.metaKey && e.key === 'm') {
            e.preventDefault()
            model.next()
        }
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault()
            temperature.increment()
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault()
            temperature.decrement()
        }
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault()
            top_p.increment()
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault()
            top_p.decrement()
        }

        // expand input
        if (e.ctrlKey && e.shiftKey && e.key === 'ArrowUp') {
            e.preventDefault()
            $user_settings_active = false
            $model_list_active    = false
            $tool_list_active     = false
            return $input_expanded = true
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'ArrowDown') {
            e.preventDefault()
            $user_settings_active = false
            $model_list_active    = false
            $tool_list_active     = false
            return $input_expanded = false
        }

        // escape / cancel
        if (e.key === 'Escape') {
            e.preventDefault()
            if ($forks[$active_fork].provisional) chat.cancelFork()
            chat.deselectText()
            $model_list_active    = false
            $user_settings_active = false
            $tool_list_active     = false
            return false
        }

        // quote selected text
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === '.') {
            e.preventDefault()
            return input.quoteSelectedText()
        }
    }
</script>

<svelte:document onkeydown={onkeydown} />
