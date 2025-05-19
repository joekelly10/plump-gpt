<script>
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { model } from '$lib/stores/ai'

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

    const modelChanged = (_) => {
        setFavicon(`/img/icons/models/${$model.icon}`)
    }
</script>
