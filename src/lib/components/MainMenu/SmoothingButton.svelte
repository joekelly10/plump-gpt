<script>
    import { config } from '$lib/stores/user'
    import { is_idle } from '$lib/stores/api'

    const clickedSmoothing = () => {
        if ($is_idle) {
            $config.smooth_output = !$config.smooth_output
        }
    }
</script>

<button class='main-menu-button smoothing-button' class:is-active={$config.smooth_output} onclick={clickedSmoothing}>
    <div class='title'>
        Smooth Output
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
    .smoothing-button
        &.is-active
            background-color: color.adjust($blue, $alpha: -0.875)

            &:hover
                background-color: color.adjust($blue, $alpha: -0.89)
                transition:       none
            
            &:active
                background-color: color.adjust($blue, $alpha: -0.9)
                transition:       none
            
            .switch
                border-color: color.adjust($background-700, $alpha: -0.5)

                .on
                    background-color: $blue
                    color:            $background-800
        
        &:not(.is-active)
            .switch
                .off
                    background-color: $blue-grey
                    color:            $background-800

        .switch
            display:         flex
            align-items:     center
            justify-content: center
            flex-wrap:       nowrap
            margin-right:    -4px
            border-radius:   99px
            border:          1px solid $background-700
            overflow:        hidden

            .switch-half
                display:         flex
                align-items:     center
                justify-content: center
                flex-grow:       0
                width:           48px
                height:          32px
                font-size:       12px
                font-weight:     600
                color:           $blue-grey
                cursor:          pointer
</style>
