<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('exa_search'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('exa_search')
        } else {
            active_tools.add('exa_search')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-exa-search-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <img class='icon exa-search-icon' src='/img/icons/exa-search-grey.png' alt='Exa Search'>
    </div>
    <div class='title'>
        Exa Search
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

        .exa-search-icon
            height: 16px
</style>
