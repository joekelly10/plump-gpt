<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('x_search'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('x_search')
        } else {
            active_tools.add('x_search')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-x-search-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon x-search-icon' src='/img/icons/x-grey.png' alt='X Search'>
    </div>
    <div class='title'>
        X Search
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

        .x-search-icon
            height: 16px
</style>
