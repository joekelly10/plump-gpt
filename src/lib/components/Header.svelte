<script>
    import { messages } from '$lib/stores/chat'

    import LoadButton from '$lib/components/Header/LoadButton.svelte'
    import SaveButton from '$lib/components/Header/SaveButton.svelte'
    import TreeButton from '$lib/components/Header/TreeButton.svelte'
    import Logo from '$lib/components/Header/Logo.svelte'

    export const saveChat = () => save_button.saveChat()

    const { cancelFork } = $props()

    let save_button
</script>

<header class='header'>
    <div class='left'>
        <LoadButton/>
        <SaveButton bind:this={save_button} />
    </div>
    <div class='title'>
        <Logo/>
    </div>
    <div class='right'>
        {#if $messages.length > 1}
            <TreeButton
                cancelFork={cancelFork}
            />
        {/if}
    </div>
</header>

<style lang='sass'>
    .header
        flex-grow:        0
        position:         relative
        z-index:          9
        height:           space.$header-height
        box-sizing:       border-box
        background-color: $background-700
        text-align:       center
        user-select:      none
    
    .left
        display:      flex
        position:     absolute
        top:          0
        left:         0
        height:       space.$header-height
        padding-left: 16px
        text-align:   left
    
    .title
        display:     inline-flex
        align-items: center
        height:      space.$header-height
    
    .right
        display:       flex
        position:      absolute
        top:           0
        right:         0
        height:        space.$header-height
        padding-right: 16px
        text-align:    right
</style>
