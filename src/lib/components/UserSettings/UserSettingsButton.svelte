<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model_list_active, user_settings_active } from '$lib/stores/app'

    import SettingsIcon from '$lib/components/Icons/Settings.svelte'

    const clicked = () => {
        $model_list_active    = false
        $user_settings_active = !$user_settings_active
    }
</script>

<button class='user-settings-button' class:active={$user_settings_active} onclick={clicked}>
    {#if $user_settings_active}
        <div class='arrow-icon' in:fade={{ duration: 125, easing: quartOut }}>
            &darr;
        </div>
    {:else}
        <SettingsIcon className='settings-icon' />
    {/if}
    <div class='label'>
        User<br>
        Settings
    </div>
</button>

<style lang='sass'>
    .user-settings-button
        display:         flex
        align-items:     center
        justify-content: center
        position:        absolute
        bottom:          space.$default-padding
        left:            16px + space.$default-padding
        z-index:         10
        width:           40px
        height:          40px
        border-radius:   8px
        border:          1px solid $background-300
        color:           $background-200
        cursor:          pointer
        transition:      border-color easing.$quart-out 100ms, background-color easing.$quart-out 100ms

        &:hover,
        &:active
            border-color:     $background-200
            background-color: $background-200
            transition:       none

            :global(.settings-icon)
                fill: $off-white

            .label
                padding-left: 20px
                opacity:      1
                transition:   opacity easing.$quart-out 100ms, padding-left easing.$quart-out 100ms

        &:active
            border-color:     color.adjust($background-200, $lightness: -2%)
            background-color: color.adjust($background-200, $lightness: -2%)
        
        &.active
            .label
                opacity: 0
    
    :global(.settings-icon)
        height: 16px
        fill:   $background-200
        
    .arrow-icon
        font-size: 20px
        color:     $off-white
    
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
</style>
