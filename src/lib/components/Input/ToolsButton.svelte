<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { active_tools } from '$lib/stores/ai'
    import { model_list_active, main_menu_active, tool_list_active, input_expanded } from '$lib/stores/app'

    const onclick = () => {
        $model_list_active = false
        $main_menu_active  = false
        $input_expanded    = false
        $tool_list_active  = !$tool_list_active
    }
</script>

<button class='tools-button' class:is-active={$tool_list_active} class:has-active-tools={$active_tools.length > 0} onclick={onclick}>
    <div class='icon'></div>
    {#if $tool_list_active || $active_tools.length > 0}
        <div class='active-tools-count' in:fade={{ duration: 75, easing: quartOut }}>
            {$active_tools.length}
        </div>
    {/if}
    <div class='label'>
        Tools
    </div>
</button>

<style lang='sass'>
    .tools-button
        display:         flex
        align-items:     center
        justify-content: center
        gap:             10px
        position:        absolute
        top:             0.5 * space.$header-height
        left:            100%
        transform:       translate(space.$default-padding, -50%)
        width:           space.$input-initial-height
        height:          space.$input-initial-height
        border-radius:   8px
        border:          1px solid transparent
        color:           $blue-grey
        cursor:          pointer
        transition:      border-color easing.$quart-out 100ms, background-color easing.$quart-out 100ms, padding easing.$quart-out 150ms

        :global(.icon)
            $size:            26px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/tools-grey.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $blue-grey

        &:hover
            border-color:     $background-800
            background-color: $background-800
            color:            $off-white
            transition:       none

            :global(.icon)
                filter: brightness(5)

            .label
                padding-left: 20px
                opacity:      1
                transition:   opacity easing.$quart-out 100ms, padding-left easing.$quart-out 100ms

        &:active
            border-color:     $background-850
            background-color: $background-850
        
        &.is-active,
        &.has-active-tools
            width:   auto
            padding: 0 16px
    
    .label
        position:       absolute
        top:            50%
        left:           100%
        transform:      translateY(-50%)
        padding-left:   16px
        font-size:      12px
        line-height:    17px
        text-align:     left
        font-weight:    600
        text-transform: uppercase
        color:          $off-white
        opacity:        0
        transition:     opacity easing.$quart-out 50ms, padding-left easing.$quart-out 100ms
        pointer-events: none

    .active-tools-count
        font-size:   14px
        font-weight: 600
</style>
