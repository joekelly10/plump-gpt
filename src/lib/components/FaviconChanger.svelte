<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { model } from '$lib/stores/ai'
    import { messages } from '$lib/stores/chat'
    import { config } from '$lib/stores/user'

    let favicon

    onMount(() => {
        if (browser) {
            favicon = document.getElementById('favicon')
        }
    })

    $effect(() => {
        if (favicon) {
            setFavicon()
        }
    })

    const setFavicon = () => {
        if ($config.change_favicon && $messages.length > 1) {
            favicon.setAttribute('href', `/img/icons/models/${$model.icon}`)
        } else {
            favicon.setAttribute('href', `/img/favicon.png`)
        }
    }
</script>
