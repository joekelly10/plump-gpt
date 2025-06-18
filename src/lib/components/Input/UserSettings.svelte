<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { user_settings_active } from '$lib/stores/app'

    import UserSettingsButton from '$lib/components/UserSettings/UserSettingsButton.svelte'
    import AvatarSetter from '$lib/components/UserSettings/AvatarSetter.svelte'
    import SmoothOutputSwitch from '$lib/components/UserSettings/SmoothOutputSwitch.svelte'
</script>

<div class='user-settings'>
    <UserSettingsButton/>

    {#if $user_settings_active}
        <div
            class='settings-list'
            in:slide={{ axis: 'y', duration: 250, easing: quartOut }}
            out:slide={{ axis: 'y', delay: 50, duration: 150, easing: quartOut }}
        >
            <div class='header'>
                <div class='title'>
                    User Settings
                </div>
                <button class='close-button' onclick={() => $user_settings_active = false }>
                    <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
                </button>
            </div>
            <div class='body'>
                <div class='settings-item avatar'>
                    <AvatarSetter/>
                </div>
                <div class='settings-item smooth-output'>
                    <SmoothOutputSwitch/>
                </div>
            </div>
        </div>
    {/if}
</div>

<style lang='sass'>
    .user-settings
        position: absolute
        bottom:   100%
        left:     0
        
        :global(.setting-description)
            margin-top:  20px
            font-size:   14px
            font-weight: 450
            line-height: font.$line-height-14px
            color:       $background-200
    
    .settings-list
        position: absolute
        bottom:   0
        left:     16px
        width:    480px

        .header
            display:          flex
            align-items:      center
            position:         relative
            width:            100%
            height:           space.$header-height
            box-sizing:       border-box
            border-radius:    12px 12px 0 0
            background-color: $background-700

            .title
                padding:     0 space.$default-padding
                font-size:   14px
                font-weight: 600
            
            .close-button
                display:         flex
                align-items:     center
                justify-content: center
                position:        absolute
                top:             0
                right:           0
                z-index:         10
                width:           space.$header-height + 12px
                height:          space.$header-height
                cursor:          pointer
                
                .close-icon
                    height: 14px
                
                &:hover
                    .close-icon
                        filter: brightness(0.8)
        
        .body
            display:          flex
            flex-direction:   column
            gap:              48px
            padding:          space.$default-padding
            padding-bottom:   space.$default-padding + 40px + 48px
            border-left:      1px solid $background-700
            border-right:     1px solid $background-700
            background-color: color.adjust(color.adjust($background-500, $lightness: -1%), $alpha: -0.05)
            backdrop-filter:  blur(4px)

            :global(.setting-title)
                margin-bottom:  20px
                font-size:      12px
                font-weight:    600
                line-height:    font.$line-height-14px
                text-transform: uppercase
                color:          $blue-grey
</style>
