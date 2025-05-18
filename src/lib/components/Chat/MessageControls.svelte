<script>
    import { createEventDispatcher } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { is_hovering } from '$lib/stores/chat/interactions'
    import { model } from '$lib/stores/ai'

    import AddIcon from '$lib/components/Icons/Add.svelte'
    import RetryIcon from '$lib/components/Icons/Retry.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'
    import ForkFromHereIcon from '$lib/components/Icons/ForkFromHere.svelte'
    import StarIcon from '$lib/components/Icons/Star.svelte'
    import StarEmptyIcon from '$lib/components/Icons/StarEmpty.svelte'

    const dispatch = createEventDispatcher()

    export let message,
               starred,
               showing_message_info

    const hoveredDelete = async () => {
        if (!$is_hovering.delete.includes(message.id)) {
            $is_hovering.delete = [...$is_hovering.delete, message.id, message.parent_id]
        }
    }

    const unhoveredDelete = async () => {
        $is_hovering.delete = $is_hovering.delete.filter(id => ![message.id, message.parent_id].includes(id))
    }

    const hoveredRegenerate = async () => {
        if (!$is_hovering.regenerate.includes(message.id)) {
            $is_hovering.regenerate = [...$is_hovering.regenerate, message.id, message.parent_id]
        }
    }

    const unhoveredRegenerate = async () => {
        $is_hovering.regenerate = $is_hovering.regenerate.filter(id => ![message.id, message.parent_id].includes(id))
    }

    const hoveredAddReply = async () => {
        if (!$is_hovering.add_reply.includes(message.id)) {
            $is_hovering.add_reply = [...$is_hovering.add_reply, message.id, message.parent_id]
        }
    }
    
    const unhoveredAddReply = async () => {
        $is_hovering.add_reply = $is_hovering.add_reply.filter(id => ![message.id, message.parent_id].includes(id))
    }

    const hoveredStar = async () => {
        if (!$is_hovering.star.includes(message.id)) {
            $is_hovering.star = [...$is_hovering.star, message.id]
        }
    }

    const unhoveredStar = async () => {
        $is_hovering.star = $is_hovering.star.filter(id => id !== message.id)
    }

    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
    const clickedRegenerate = () => dispatch('regenerateReply')
    const clickedDelete     = () => dispatch(message.has_siblings ? 'deleteOne' : 'deleteBoth')
    const clickedFork       = () => dispatch('forkFrom', { message_id: message.id })
    const clickedStar       = () => dispatch('toggleStar')
</script>

<div class='message-controls-right' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
    {#if message.is_last}
        <button class='message-control-button add' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
            <AddIcon className='icon' />
        </button>
        <button class='message-control-button retry' on:click={clickedRegenerate} on:mouseenter={hoveredRegenerate} on:mouseleave={unhoveredRegenerate}>
            <RetryIcon className='icon' />
        </button>
        <button class='message-control-button delete' on:click={clickedDelete} on:mouseenter={hoveredDelete} on:mouseleave={unhoveredDelete}>
            <DeleteIcon className='icon' />
        </button>
    {:else}
        <button class='message-control-button fork' title='Fork' on:click={clickedFork}>
            <ForkFromHereIcon className='icon' />
        </button>
    {/if}
</div>

{#if !showing_message_info}
    <div class='message-controls-left' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
        <button class='message-control-button star' class:starred={starred} on:click={clickedStar} on:mouseenter={hoveredStar} on:mouseleave={unhoveredStar}>
            <StarIcon className='icon full' />
            <StarEmptyIcon className='icon empty' />
        </button>
    </div>
{/if}

<style lang='sass'>
    .message-controls-right
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
        width:       48px
    
    .message-controls-left
        display:         flex
        align-items:     flex-end
        justify-content: flex-end
        position:        absolute
        bottom:          0
        right:           100%
        margin-right:    space.$default-padding
        width:           48px
    
    .message-controls-right,
    .message-controls-left
        :global
            .message-control-button
                $button-size:    40px
                display:         flex
                align-items:     center
                justify-content: center
                position:        relative
                margin-top:      16px
                width:           $button-size
                height:          $button-size
                box-sizing:      border-box
                border-radius:   8px
                border:          1px solid $background-lighter
                cursor:          pointer
                transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s

                .icon
                    fill:       $background-lightest
                    color:      $background-lightest
                    transition: fill easing.$quart-out 0.1s, color easing.$quart-out 0.1s

                &:hover,
                &:active
                    transition: none

                    .icon
                        fill:       $background-darker
                        color:      $background-darker
                        transition: none

                &.add
                    .icon
                        height:    11px
                        transform: rotate(45deg)

                    &:hover
                        border-color:     $blue
                        background-color: $blue

                        //  hack/fix: when adding a 6th reply, the forks container
                        //  expands on hover, moving the button down, causing the hover
                        //  to glitch on/off, so we need to compensate for that with
                        //  a run-off area above.  (And to the right, for the edge case
                        //  where the scrollbar is added to the screen by the change
                        //  in height):

                        &:before
                            content:  ''
                            position: absolute
                            top:      -50px
                            left:     0
                            width:    50px
                            height:   90px

                    &:active
                        border-color:     color.adjust($blue, $lightness: -3%)
                        background-color: color.adjust($blue, $lightness: -3%)

                &.retry
                    .icon
                        height: 18px
                    &:hover
                        border-color:     white
                        background-color: white
                    &:active
                        border-color:     color.adjust($off-white, $lightness: -6%)
                        background-color: color.adjust($off-white, $lightness: -6%)
                    
                &.delete
                    .icon
                        height: 19px
                    &:hover
                        border-color:     $coral
                        background-color: $coral
                    &:active
                        border-color:     color.adjust($coral, $lightness: -4%)
                        background-color: color.adjust($coral, $lightness: -4%)

                &.fork
                    .icon
                        height:    13px
                        transform: rotate(45deg)
                    &:hover
                        border-color:     $blue
                        background-color: $blue
                    &:active
                        border-color:     color.adjust($blue, $lightness: -3%)
                        background-color: color.adjust($blue, $lightness: -3%)

                &.star
                    height: 80px
                    .icon
                        &.empty
                            height: 19px
                            fill:   $background-lightest
                        &.full
                            display: none
                            height: 19px
                            fill:   $yellow
                    &:hover
                        border-color:     $background-lightest
                        background-color: $background-lightest
                        .icon
                            &.empty
                                display: none
                            &.full
                                display: block
                                height:  19px
                                fill:    $yellow
                    &.starred
                        border-color:     $background-darker
                        background-color: $yellow
                        .icon
                            &.empty
                                display: none
                            &.full
                                display: block
                                height:  19px
                                fill:    $background-darker
                        &:hover
                            background-color: color.adjust($yellow, $lightness: -5%)
</style>
