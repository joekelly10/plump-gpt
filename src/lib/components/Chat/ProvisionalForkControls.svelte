<script>
    import { createEventDispatcher } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_hovering } from '$lib/stores/chat/interactions'
    import { model } from '$lib/stores/ai'

    import AddIcon from '$lib/components/Icons/Add.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'

    const dispatch = createEventDispatcher()

    export let message

    const hoveredAddReply = async () => {
        $is_hovering.add_reply = [...$is_hovering.add_reply, message.id, message.parent_id]
    }

    const unhoveredAddReply = async () => {
        $is_hovering.add_reply = $is_hovering.add_reply.filter(id => ![message.id, message.parent_id].includes(id))
    }

    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
    const clickedCancelFork = () => dispatch('cancelProvisionalFork')
</script>

<div class='provisional-fork-controls' in:fly={{ x: -32, delay: 0, duration: 250, easing: quartOut }}>
    <button class='provisional-fork-button add-reply' title='Add another reply' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
        <div class='icon-container'>
            <AddIcon className='icon' />
        </div>
        Add Reply
        <div class='model-container'>
            <img class='avatar' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
            <span class='arrow'>→</span>
        </div>
    </button>
    <button class='provisional-fork-button cancel-fork' title='Cancel Fork (esc)' on:click={clickedCancelFork}>
        <div class='icon-container'>
            <DeleteIcon className='icon' />
        </div>
        Cancel Fork
    </button>
</div>

<style lang='sass'>
    .provisional-fork-controls
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding

        :global
            .provisional-fork-button
                $button-size:  48px
                display:       flex
                align-items:   center
                position:      relative
                margin-top:    16px
                height:        $button-size
                box-sizing:    border-box
                padding:       0
                padding-right: 21px
                border-radius: 8px
                border:        1px solid $background-lighter
                font-size:     16px
                font-weight:   425
                color:         $background-lightest
                white-space:   nowrap
                cursor:        pointer

                .icon-container
                    display:         flex
                    justify-content: center
                    align-items:     center
                    width:           $button-size
                    height:          $button-size

                .icon
                    fill: $background-lightest
                
                .model-container
                    display:         flex
                    align-items:     center
                    justify-content: center
                    position:        absolute
                    top:             0
                    left:            -1px
                    transform:       translateY(-20px) scale(0.5)
                    width:           $button-size
                    height:          $button-size
                    box-sizing:      border-box
                    opacity:         0
                    pointer-events:  none
                    transition:      opacity 0.1s easing.$quart-out, transform 0.1s easing.$quart-out

                    .avatar
                        height: 21px

                    .arrow
                        position:   absolute
                        top:        50%
                        left:       50%
                        transform:  translate(10px, -50%)
                        opacity:    0
                        font-size:  16px
                        color:      $off-white
                        transition: none

                &:hover,
                &:active
                    color: $background-darker

                    .icon
                        fill: $background-darker

                &.add-reply
                    .icon
                        height:    11px
                        transform: rotate(45deg)
                    &:hover
                        border-color:     $blue
                        background-color: $blue
                        .model-container
                            transform:      translateY(-58px)
                            opacity:        1
                            pointer-events: all
                            transition:     opacity 0.1s easing.$quart-out, transform 0.1s easing.$quart-out
                            .arrow
                                transform:  translate(18px, -50%)
                                opacity:    1
                                transition: transform 0.1s easing.$quart-out 0.25s, opacity 0.1s easing.$quart-out 0.25s
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
                    &:active
                        border-color:     color.adjust($blue, $lightness: -3%)
                        background-color: color.adjust($blue, $lightness: -3%)

                &.cancel-fork
                    .icon
                        height: 19px
                    &:hover
                        border-color:     $coral
                        background-color: $coral
                    &:active
                        border-color:     color.adjust($coral, $lightness: -3%)
                        background-color: color.adjust($coral, $lightness: -3%)
</style>
