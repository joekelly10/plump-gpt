<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages, highlights } from '$lib/stores/chat'
    import { model } from '$lib/stores/ai'
    import AddIcon from '$lib/components/Icons/Add.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'

    const dispatch = createEventDispatcher()

    export let message

    const hoveredAddReply = async () => {
        $highlights.add_reply = [...$highlights.add_reply, message.id, message.parent_id]
    }

    const unhoveredAddReply = async () => {
        $highlights.add_reply = $highlights.add_reply.filter(id => ![message.id, message.parent_id].includes(id))
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
                display:         flex
                justify-content: center
                align-items:     center
                position:        relative
                margin-top:      16px
                padding:         0
                padding-right:   20px
                border-radius:   8px
                border:          1px solid $background-lighter
                color:           $background-lightest
                white-space:     nowrap
                cursor:          pointer

                .icon-container
                    display:         flex
                    justify-content: center
                    align-items:     center
                    width:           48px
                    height:          48px

                .icon
                    fill: $background-lightest
                
                .model-container
                    display:          flex
                    align-items:      center
                    justify-content:  center
                    position:         absolute
                    top:              0
                    left:             -1px
                    transform:        translateY(-20px) scale(0.5)
                    width:            48px
                    height:           48px
                    box-sizing:       border-box
                    opacity:          0
                    pointer-events:   none
                    transition:       opacity 0.1s easing.$quart-out, transform 0.1s easing.$quart-out

                    .avatar
                        height: 21px

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
