<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    import DeleteIcon from '$lib/components/Icons/Delete.svelte'

    let { cancelFork } = $props()
</script>

<div class='provisional-fork-controls' in:fly={{ x: -32, duration: 125, easing: quartOut }}>
    <button class='cancel-fork-button' title='Cancel Fork (esc)' onclick={cancelFork}>
        <div class='icon-container'>
            <DeleteIcon className='icon' />
        </div>
        <div class='text'>
            Cancel Fork
        </div>
    </button>
</div>

<style lang='sass'>
    .provisional-fork-controls
        display:        flex
        flex-direction: column
        align-items:    flex-start
        gap:            16px
        position:       absolute
        bottom:         0
        left:           100%
        margin-left:    space.$default-padding
        user-select:    none

    .cancel-fork-button
        $button-size:     40px
        display:          flex
        align-items:      center
        height:           $button-size
        box-sizing:       border-box
        padding:          0
        border-radius:    8px
        border:           1px solid $coral
        background-color: $coral
        font-size:        14px
        font-weight:      450
        color:            $background-700
        white-space:      nowrap
        cursor:           pointer

        &:hover
            border-color:     color.adjust($coral, $alpha: -0.075)
            background-color: color.adjust($coral, $alpha: -0.075)
            color:            $background-800

            :global(.icon)
                fill: $background-800

        &:active
            border-color:     color.adjust($coral, $alpha: -0.125)
            background-color: color.adjust($coral, $alpha: -0.125)
            color:            $background-800

            :global(.icon)
                fill: $background-800

        .icon-container
            display:         flex
            justify-content: center
            align-items:     center
            width:           $button-size
            height:          $button-size

        :global(.icon)
            height: 19px
            fill:   $background-700
        
        .text
            padding-right: 16px
</style>
