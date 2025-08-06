<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('reasoning_effort'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('reasoning_effort')
        } else {
            active_tools.add('reasoning_effort')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-reasoning-effort-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon thinking-icon' src='/img/icons/thinking-grey.png' alt='Reasoning Effort'>
    </div>
    <div class='title'>
        Reasoning Effort
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

        .thinking-icon
            height: 16px
            top:    1px
</style>
