<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('web_search'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('web_search')
        } else {
            active_tools.add('web_search')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-web-search-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon web-search-icon' src='/img/icons/web-search-grey.png' alt='Web Search'>
    </div>
    <div class='title'>
        Web Search
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

        .web-search-icon
            height: 16px
</style>
