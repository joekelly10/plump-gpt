<script>
    import LoadButton from '$lib/components/Header/LoadButton.svelte'
    import SaveButton from '$lib/components/Header/SaveButton.svelte'
    import Logo from '$lib/components/Header/Logo.svelte'
    import TopPControl from '$lib/components/Header/TopPControl.svelte'
    import TemperatureControl from '$lib/components/Header/TemperatureControl.svelte'
    import ModelSwitcher from '$lib/components/Header/ModelSwitcher.svelte'

    let save_button

    export const save = () => save_button.save()
</script>

<header class='header'>
    <div class='load-and-save'>
        <LoadButton/>
        <SaveButton bind:this={save_button} />
    </div>
    <div class='title'>
        <Logo/>
    </div>
    <div class='model'>
        <TopPControl/>
        <TemperatureControl/>
        <ModelSwitcher/>
    </div>
</header>

<style lang='sass'>
    .header
        flex-grow:        0
        position:         relative
        z-index:          9
        height:           space.$header-height
        box-sizing:       border-box
        background-color: $background-darker
        text-align:       center
        user-select:      none
    
    .load-and-save
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
    
    .model
        display:       flex
        position:      absolute
        top:           0
        right:         0
        height:        space.$header-height
        padding-right: 16px
        text-align:    right
</style>
