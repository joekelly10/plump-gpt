<script>
    import EyeIcon from '$lib/components/Icons/Eye.svelte'
    import SystemPromptIcon from '$lib/components/Icons/SystemPrompt.svelte'

    let { close, read_only } = $props()
</script>

<div class='prompt-editor-header'>
    {#if read_only}
        <div class='title'>
            <span class='title-text'>
                System Prompt
            </span>
            <span class='subtitle-text'>
                (Read only)
            </span>
        </div>
    {/if}
    <button class='close-button' onclick={close}>
        <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
    </button>
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
        height:           space.$prompt-editor-header-height
        box-sizing:       border-box
        background-color: $background-800
        user-select:      none
    
    .title-text
        font-size:      14px
        font-weight:    700
        color:          $off-white
        text-transform: uppercase

    .subtitle-text
        margin-left: 4px
        font-size:   14px
        font-weight: 450
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
