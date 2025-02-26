<script>
    import { createEventDispatcher } from 'svelte'

    import EyeIcon from '$lib/components/Icons/Eye.svelte'
    import SystemPromptIcon from '$lib/components/Icons/SystemPrompt.svelte'

    const dispatch = createEventDispatcher()

    export let read_only
</script>

<div class='prompt-editor-header'>
    <button class='close-button' on:click={() => dispatch('close')}>
        <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
    </button>
    <div class='title'>
        {#if read_only}
            <EyeIcon className='icon eye-icon' />
            <div class='title-text'>
                System Prompt<br>
                <span class='subtitle-text'>
                    Read only
                </span>
            </div>
        {:else}
            <SystemPromptIcon className='icon system-prompt-icon' />
            <div class='title-text'>
                System Prompt<br>
                <span class='subtitle-text'>
                    Editing
                </span>
            </div>
        {/if}
    </div>
</div>

<style lang='sass'>
    .prompt-editor-header
        display:          flex
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        width:            100%
        box-sizing:       border-box
        padding:          24px 0
        background-color: $background-darkest
        user-select:      none
    
    .title
        display:     flex
        align-items: center
        gap:         16px
        font-weight: 600
        color:       $off-white

        :global
            .eye-icon
                height: 13px
                fill:   $off-white

            .system-prompt-icon
                height: 21px
                fill:   $off-white

            .subtitle-text
                font-size:   14px
                font-weight: 500
                color:       $blue-grey

    .close-button
        position:    absolute
        top:         0
        right:       0
        height:      100%
        box-sizing:  border-box
        padding:     0 space.$default-padding
        font-weight: 500
        cursor:      pointer

        .close-icon
            height: 16px
        
        &:hover
            .close-icon
                filter: brightness(0.8)
</style>
