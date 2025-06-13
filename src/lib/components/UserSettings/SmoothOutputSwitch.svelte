<script>
    import { config } from '$lib/stores/user'
</script>

<div class='smooth-output-switch'>
    <div class='setting-title'>
        Smooth Output
    </div>
    <div class='switch-container'>
        <button
            class='button off-button'
            class:selected={$config.smooth_output === false}
            on:click={() => $config.smooth_output = false}
        >
            Off
        </button>
        <button
            class='button on-button'
            class:selected={$config.smooth_output === true}
            on:click={() => $config.smooth_output = true}
        >
            On
        </button>
    </div>
    <div class='setting-description'>
        Smoothly write the AI's output onto the screen, even if it gets delivered in irregular chunks
    </div>
</div>

<style lang='sass'>
    .switch-container
        display:         inline-flex
        align-items:     center
        justify-content: center
        flex-wrap:       nowrap
        border-radius:   99px
        border:          1px solid $background-800
        overflow:        hidden

        .button
            width:       60px
            height:      40px
            font-size:   14px
            font-weight: 600
            color:       $background-200
            cursor:      pointer

            &:hover,
            &:active
                background-color: color.adjust($background-500, $lightness: 1%)
                color:            $blue-grey
            
            &:active
                background-color: color.adjust($background-500, $lightness: 0%)
            
            &.selected
                background-color: $off-white
                color:            $background-700

                &:hover,
                &:active
                    background-color: color.mix($background-500, $off-white, 5%)
                
                &:active
                    background-color: color.mix($background-500, $off-white, 7.5%)
</style>
