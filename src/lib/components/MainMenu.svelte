<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { main_menu_active, loader_active } from '$lib/stores/app'
    import { is_idle } from '$lib/stores/api'
    import { messages } from '$lib/stores/chat'

    import AvatarButton from '$lib/components/MainMenu/AvatarButton.svelte'
    import SmoothingButton from '$lib/components/MainMenu/SmoothingButton.svelte'

    const { deleteChat, newChat } = $props()

    const chat_has_messages = $derived($messages.length > 1)

    const clickedLoad = () => {
        if ($is_idle) {
            $loader_active    = true
            $main_menu_active = false
        }
    }

    const clickedDelete = () => {
        if ($is_idle && chat_has_messages) {
            if (confirm('Delete current chat?  Press OK to confirm.')) {
                deleteChat()
                $main_menu_active = false
            }
        }
    }

    const clickedNew = () => {
        if ($is_idle) {
            newChat()
            $main_menu_active = false
        }
    }
</script>

<div
    class='main-menu'
    in:slide={{ axis: 'y', duration: 200, easing: quartOut }}
    out:slide={{ axis: 'y', delay: 50, duration: 125, easing: quartOut }}
>
    <div class='main-menu-group-heading'>
        Chat
    </div>
    <button class='main-menu-button load-button' onclick={clickedLoad}>
        <div class='title'>
            Load
        </div>
        <div class='shortcut'>
            ⌘ O
        </div>
    </button>
    <button class='main-menu-button delete-button' onclick={clickedDelete}>
        <div class='title'>
            Delete
        </div>
        <div class='shortcut'>
            ⌘ ⌥ ⌫
        </div>
    </button>
    <button class='main-menu-button new-chat-button' onclick={clickedNew}>
        <div class='title'>
            New
        </div>
        <div class='shortcut'>
            ^ N
        </div>
    </button>
    <div class='main-menu-group-heading'>
        User Settings
    </div>
    <AvatarButton/>
    <SmoothingButton/>
</div>

<style lang='sass'>
    .main-menu
        position:         fixed
        top:              space.$header-height
        left:             16px
        display:          flex
        flex-direction:   column
        z-index:          5
        width:            520px
        box-sizing:       border-box
        border-radius:    0 0 8px 8px
        border:           1px solid $background-700
        border-top:       1.5px solid $background-850
        background-color: $modal-blur-bg-color
        backdrop-filter:  blur(4px)
        font-size:        14px
        overflow:         hidden
        user-select:      none

        :global
            .main-menu-button
                display:         flex
                align-items:     center
                justify-content: space-between
                position:        relative
                width:           100%
                height:          space.$header-height
                box-sizing:      border-box
                padding:         0 space.$default-padding
                border-top:      1px solid $background-700
                text-align:      left
                cursor:          pointer

                &:hover
                    background-color: $background-800
                    transition:       none
                
                &:active
                    background-color: $background-850
                    transition:       none

                .title
                    font-weight: 600
                    line-height: 20px

                .shortcut
                    font-weight: 600
                    color:       $blue-grey
    
    .main-menu-group-heading
        display:         flex
        align-items:     center
        justify-content: center
        width:           100%
        height:          space.$header-height
        border-top:      1px solid $background-700
        font-size:       12px
        font-weight:     600
        color:           $blue-grey
        text-transform:  uppercase

        &:first-child
            border-top: none
</style>
