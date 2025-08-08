<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('verbosity'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('verbosity')
        } else {
            active_tools.add('verbosity')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-verbosity-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon verbosity-icon' src='/img/icons/verbosity-grey.png' alt='Verbosity'>
    </div>
    <div class='title'>
        Verbosity
    </div>
    <div class='switch'>
        <div class='switch-half off'>
            Off
        </div>
        <div class='switch-half on'>
            On
        </div>
    </div>
</button>

<style lang='sass'>
    .toggle-tool-button
        +shared.toggle_tool_button_styles

        .verbosity-icon
            height: 16px
</style>
