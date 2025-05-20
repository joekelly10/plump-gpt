<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { model } from '$lib/stores/ai'
    import { messages } from '$lib/stores/chat'

    let favicon

    onMount(() => {
        if (browser) {
            favicon = document.getElementById('favicon')
        }
    })

    export const setFavicon = (href) => {
        if (browser && favicon) {
            favicon.setAttribute('href', href)
        }
    }

    $: modelChanged($model)
    $: messagesChanged($messages)

    const modelChanged = (_) => {
        if ($messages.length > 1) {
            setFavicon(`/img/icons/models/${$model.icon}`)
        }
    }

    const messagesChanged = (_) => {
        if ($messages.length > 1) {
            setFavicon(`/img/icons/models/${$model.icon}`)
        } else {
            setFavicon(`/img/favicon.png`)
        }
    }
</script>
