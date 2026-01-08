<script>
    import { active_tools } from '$lib/stores/ai'

    const is_active = $derived($active_tools.includes('context_cache'))

    const clicked = (e) => {
        e.preventDefault()
        if (is_active) {
            active_tools.remove('context_cache')
        } else {
            active_tools.add('context_cache')
        }
    }
</script>

<button
    class='toggle-tool-button toggle-context-cache-button'
    class:is-active={is_active}
    onclick={clicked}
>
    <div class='icon-container'>
        <div class='icon context-cache-icon'></div>
    </div>
    <div class='title'>
        Context Cache
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

        .context-cache-icon
            $size:            16px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/cache.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey
</style>
