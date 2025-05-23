<script>
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model_list_active, user_settings_active } from '$lib/stores/app'

    import AvatarSetter from '$lib/components/UserSettings/AvatarSetter.svelte'
    import SmoothOutputSwitch from '$lib/components/UserSettings/SmoothOutputSwitch.svelte'

    const clickedSettingsButton = () => {
        $model_list_active    = false
        $user_settings_active = !$user_settings_active
    }
</script>

<div
    class='user-settings'
    class:expanded={$user_settings_active}
>
    <button
        class='settings-button'
        on:click={clickedSettingsButton}
    >
        {#if $user_settings_active}
            <div class='arrow-icon' in:fade={{ duration: 125, easing: quartOut }}>
                &darr;
            </div>
        {:else}
            <div class='list-icon' in:fade={{ duration: 125, easing: quartOut }}>
                <div class='line'></div>
                <div class='line'></div>
                <div class='line'></div>
            </div>
        {/if}
        <div class='label'>
            Settings
        </div>
    </button>

    {#if $user_settings_active}
        <div
            class='settings-list'
            in:slide={{ axis: 'y', duration: 250, easing: quartOut }}
            out:slide={{ axis: 'y', delay: 50, duration: 150, easing: quartOut }}
        >
            <button class='close-button' on:click={() => $user_settings_active = false }>
                <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
            </button>
            <div class='settings-item avatar'>
                <div class='title'>
                    Avatar
                </div>
                <AvatarSetter/>
            </div>
            <div class='settings-item smooth-output'>
                <div class='title'>
                    Smooth Output
                </div>
                <SmoothOutputSwitch/>
            </div>
        </div>
    {/if}
</div>

<style lang='sass'>
    .user-settings
        position: absolute
        bottom:   100%
        left:     0

        &.expanded
            .settings-button
                .label
                    opacity: 0

    .settings-button
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
        border:          1px solid $background-lightest
        color:           $background-lightest
        cursor:          pointer
        transition:      border-color easing.$quart-out 100ms, background-color easing.$quart-out 100ms
        
        .list-icon
            display:         flex
            flex-direction:  column
            align-items:     center
            justify-content: center
            gap:             3px
            
            .line
                width:            16px
                height:           1.5px
                border-radius:    99px
                background-color: $background-lightest
                transition:       background-color easing.$quart-out 100ms
            
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

        &:hover,
        &:active
            border-color:     $background-lightest
            background-color: $background-lightest
            transition:       none

            .list-icon
                .line
                    background-color: $off-white
                    transition:       none
            
            .label
                padding-left: 20px
                opacity:      1
                transition:   opacity easing.$quart-out 100ms, padding-left easing.$quart-out 100ms

        &:active
            border-color:     color.adjust($background-lightest, $lightness: -2%)
            background-color: color.adjust($background-lightest, $lightness: -2%)
    
    .settings-list
        display:          flex
        flex-direction:   column
        gap:              48px
        position:         absolute
        bottom:           0
        left:             16px
        width:            480px
        box-sizing:       border-box
        padding:          space.$default-padding
        padding-bottom:   space.$default-padding + 40px + 48px
        border-radius:    8px 8px 0 0
        border:           1px solid $background-darkest
        border-bottom:    none
        background-color: color.adjust(color.adjust($background, $lightness: -1%), $alpha: -0.05)
        backdrop-filter:  blur(4px)

        .title
            margin-bottom:  20px
            font-size:      12px
            font-weight:    600
            line-height:    font.$line-height-14px
            text-transform: uppercase
            color:          $blue-grey
        
        .close-button
            display:         flex
            align-items:     center
            justify-content: center
            position:        absolute
            top:             0
            right:           0
            width:           space.$header-height
            height:          space.$header-height
            cursor:          pointer
            
            .close-icon
                height: 14px
            
            &:hover
                .close-icon
                    filter: brightness(0.8)
            
</style>
