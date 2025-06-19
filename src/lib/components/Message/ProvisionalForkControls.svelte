<script>
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_hovering } from '$lib/stores/chat/interactions'

    import AddIcon from '$lib/components/Icons/Add.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'

    let {
        // actions
        addReply,
        cancelFork,

        // passive
        message
    } = $props()

    const mouseenterAddReply = async () => {
        $is_hovering.add_reply = [...$is_hovering.add_reply, message.id, message.parent_id]
    }

    const mouseleaveAddReply = async () => {
        $is_hovering.add_reply = $is_hovering.add_reply.filter(id => ![message.id, message.parent_id].includes(id))
    }
</script>

<div class='provisional-fork-controls' in:fly={{ x: -32, delay: 0, duration: 250, easing: quartOut }}>
    <button class='provisional-fork-button add-reply' title='Add another reply' onclick={addReply} onmouseenter={mouseenterAddReply} onmouseleave={mouseleaveAddReply}>
        <div class='icon-container'>
            <AddIcon className='icon' />
        </div>
        <div class='text'>
            Add Reply
        </div>
    </button>
    <button class='provisional-fork-button cancel-fork' title='Cancel Fork (esc)' onclick={cancelFork}>
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

    .provisional-fork-button
        $button-size:  40px
        display:       flex
        align-items:   center
        height:        $button-size
        box-sizing:    border-box
        padding:       0
        border-radius: 8px
        border:        1px solid $background-300
        font-size:     14px
        font-weight:   450
        color:         $background-200
        white-space:   nowrap
        cursor:        pointer

        .icon-container
            display:         flex
            justify-content: center
            align-items:     center
            width:           $button-size
            height:          $button-size
        
        .text
            padding-right: 16px

        &.add-reply
            :global(.icon)
                height:    11px
                transform: rotate(45deg)
                fill:      $background-200

            &:hover
                border-color:     $blue
                background-color: $blue
                color:            $background-700

                //  hack/fix: when adding a 6th reply, the forks container
                //  expands on hover, moving the button down, causing the hover
                //  to glitch on/off, so we need to compensate for that with
                //  a run-off area above.  (And to the right, for the edge case
                //  where the scrollbar is added to the screen by the change
                //  in height):

                &:before
                    content:  ''
                    position: absolute
                    top:      -58px
                    left:     0
                    width:    100%
                    height:   100px
                
                :global(.icon)
                    fill: $background-700

            &:active
                border-color:     color.adjust($blue, $lightness: -3%)
                background-color: color.adjust($blue, $lightness: -3%)
                color:            $background-800

                :global(.icon)
                    fill: $background-800

        &.cancel-fork
            border-color:     $coral
            background-color: $coral
            color:            $background-700

            :global(.icon)
                height: 19px
                fill:   $background-700

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
</style>
