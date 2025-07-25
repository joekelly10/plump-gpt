<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('thinking_budget'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('thinking_budget')
        } else {
            active_tools.add('thinking_budget')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-thinking-budget-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon thinking-icon' src='/img/icons/thinking-grey.png' alt='Thinking Budget'>
    </div>
    <div class='title'>
        Thinking Budget
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
