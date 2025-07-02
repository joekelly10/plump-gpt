<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_idle } from '$lib/stores/api'

    let { deleteChat } = $props()

    const clicked = () => {
        if ($is_idle) {
            if (confirm('Delete current chat?  Press OK to confirm.')) {
                deleteChat()
            }
        }
    }
</script>

<button
    class='delete-button'
    title='Delete chat (⌘+⌥+Backspace)'
    onclick={clicked}
    in:fade={{ delay: 250, duration: 250, easing: quartOut }}
    out:fade={{ duration: 125, easing: quartOut }}
>
    <span class='text'>
        Delete
    </span>
</button>

<style lang='sass'>
    .delete-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        height:          space.$header-height
        padding:         0 space.$default-padding
        font-size:       14px
        font-weight:     450
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        &:hover
            background-color: $background-800
            font-weight:      600
            color:            $coral
            transition:       none

            .text
                margin-left: -0.5px

        &:active
            background-color: $background-850
            transition:       none
</style>
