<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { avatar_href } from '$lib/stores/user'
    import { model } from '$lib/stores/ai'

    let {
        // bindable
        show_info = $bindable(false),

        // passive
        message
    } = $props()

    let copy_timer
    
    let show_copied = $state(false)

    const copyMessageToClipboard = async () => {
        clearTimeout(copy_timer)
        await navigator.clipboard.writeText(message.content)
        show_copied = true
        copy_timer = setTimeout(() => { show_copied = false }, 2000)
    }

    const setModel = () => {
        if (message.model.family) {
            model.setByIdAndFamily(message.model.id, message.model.family)
        } else {
            model.setById(message.model.id)
        }
    }
</script>

<div class='avatar-container'>
    {#if message.role === 'user'}
        <img
            class='avatar user'
            src={$avatar_href}
            alt='You'
            ondblclick={copyMessageToClipboard}
        >
    {:else}
        <img
            class='avatar ai'
            src='/img/icons/models/{message.model.icon}'
            alt='{message.model.name}'
            onmouseenter={() => { show_info = true }}
            onmouseleave={() => { show_info = false }}
            onclick={setModel}
            ondblclick={copyMessageToClipboard}
        >
    {/if}
    {#if show_copied}
        <div
            class='copied-feedback'
            in:fly={{ y: 8, duration: 100, easing: quartOut }}
            out:fade={{ duration: 100, easing: quartOut }}
        >
            Message copied!
        </div>
    {/if}
</div>

<style lang='sass'>
    .avatar-container
        display:         flex
        align-items:     center
        justify-content: center
        position:        absolute
        top:             0
        left:            0
        width:           space.$avatar-container-width
        height:          space.$avatar-container-width
        text-align:      center

        .avatar
            height:      32px
            transition:  transform easing.$quart-out 0.125s
            cursor:      pointer
            user-select: none

            &.user
                border-radius: 8px

            &:hover
                transform:  scale(1.1)
                transition: none
            
            &:active
                transform:  scale(1.05)
                transition: none
        
    .copied-feedback
        position:         absolute
        bottom:           100%
        left:             50%
        transform:        translate(-50%, 4px)
        padding:          12px 24px
        border-radius:    8px
        background-color: $background-700
        font-size:        14px
        font-weight:      500
        line-height:      font.$line-height-14px
        color:            $off-white
        white-space:      nowrap

        &:after
            content:        ''
            position:       absolute
            top:            100%
            left:           50%
            transform:      translateX(-50%)
            border-width:   8px
            border-style:   solid
            border-color:   $background-700 transparent transparent
</style>
