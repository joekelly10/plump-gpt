<script>
    import { loader_active } from '$lib/stores/app.js'
    import { is_idle } from '$lib/stores/api.js'

    const clicked = () => {
        if ($is_idle) $loader_active = true
    }

    const keydown = (e) => {
        if ((e.ctrlKey && e.key === 'o') || (e.metaKey && e.key === 'o')) {
            e.preventDefault()
            if ($is_idle) $loader_active = !$loader_active
        }
    }
</script>

<svelte:document onkeydown={keydown} />

<button class='load-button' title='Open chat (⌘+O)' onclick={clicked}>
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
        font-weight:     450
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        &:hover
            background-color: $background-800
            font-weight:      600
            color:            $off-white
            transition:       none

        &:active
            background-color: color.adjust($background-800, $lightness: -1%)
            transition:       none
</style>
