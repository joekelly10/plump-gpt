<script>
    import { loader_active } from '$lib/stores/chat.js'
    import { api_status } from '$lib/stores/ai.js'

    const clickedLoad = () => {
        if ($api_status === 'idle') $loader_active = true
    }

    const keydown = (e) => {
        if ((e.ctrlKey && e.key === 'o') || (e.metaKey && e.key === 'o')) {
            e.preventDefault()
            if ($api_status === 'idle') $loader_active = !$loader_active
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='load-button' title='Open chat (⌘+O)' on:click={clickedLoad}>
    Load
</button>

<style lang='sass'>
    .load-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        width:           space.$load-save-button-width
        height:          space.$header-height
        font-size:       14px
        color:           $background-lightest
        cursor:          pointer

        &:hover
            background-color: $background-darkest
            font-weight:      600
            color:            white
        
        &:active
            background-color: color.adjust($background-darkest, $lightness: -1%)
</style>
