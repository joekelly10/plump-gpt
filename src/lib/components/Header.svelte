<script>
    import { messages } from '$lib/stores/chat'

    import DeleteButton from '$lib/components/Header/DeleteButton.svelte'
    import LoadButton from '$lib/components/Header/LoadButton.svelte'
    import SaveButton from '$lib/components/Header/SaveButton.svelte'
    import TreeButton from '$lib/components/Header/TreeButton.svelte'
    import Logo from '$lib/components/Header/Logo.svelte'

    export const saveChat = () => save_button.saveChat()

    const { cancelFork, deleteChat } = $props()

    let save_button

    const chat_has_messages = $derived($messages.length > 1)
</script>

<header class='header'>
    <div class='left'>
        <LoadButton/>
        <SaveButton bind:this={save_button} />
        {#if chat_has_messages}
            <DeleteButton
                deleteChat={deleteChat}
            />
        {/if}
    </div>
    <div class='title'>
        <Logo/>
    </div>
    <div class='right'>
        {#if chat_has_messages}
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
