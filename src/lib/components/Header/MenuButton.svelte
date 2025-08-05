<script>
    import { main_menu_active, model_list_active, tool_list_active, input_expanded } from '$lib/stores/app'
    import { is_idle } from '$lib/stores/api'

    const clicked = () => {
        if ($is_idle) {
            $model_list_active = false
            $tool_list_active  = false
            $input_expanded    = false
            $main_menu_active  = !$main_menu_active
        }
    }
</script>

<button class='main-menu-button' class:is-active={$main_menu_active} title='Menu' onclick={clicked}>
    <div class='initial-text'>
        Menu
    </div>
    <div class='bold-text'>
        Menu
    </div>
</button>

<style lang='sass'>
    .main-menu-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        position:        relative
        height:          space.$header-height
        padding:         0 space.$default-padding
        font-size:       14px
        font-weight:     450
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        &.is-active
            background-color: $background-850
            color:            $off-white

            .initial-text
                opacity: 0

            .bold-text
                opacity: 1

        &:hover
            background-color: $background-800
            color:            $off-white
            transition:       none

            .initial-text
                opacity: 0

            .bold-text
                opacity: 1

        &:active
            background-color: $background-850
            transition:       none
        
        .initial-text
            opacity: 1

        .bold-text
            position:    absolute
            top:         50%
            left:        50%
            transform:   translate(-50%, -50%)
            font-weight: 600
            opacity:     0
</style>
