<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('google_search'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('google_search')
        } else {
            active_tools.add('google_search')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-google-search-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <div class='icon google-search-icon'></div>
    </div>
    <div class='title'>
        Google Search
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

        .google-search-icon
            $size:            16px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/google.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey
</style>
