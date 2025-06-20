<script>
    import { tick } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages, forks, active_fork, stars, highlights } from '$lib/stores/chat'
    import { is_hovering, is_deleting, is_adding_reply, is_provisionally_forking } from '$lib/stores/chat/interactions'
    import { insertIdIntoOrderedArray } from '$lib/utils/helpers'
    import { is_idle } from '$lib/stores/api'

    import AddIcon from '$lib/components/Icons/Add.svelte'
    import RetryIcon from '$lib/components/Icons/Retry.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'
    import ForkFromHereIcon from '$lib/components/Icons/ForkFromHere.svelte'
    import StarIcon from '$lib/components/Icons/Star.svelte'
    import StarEmptyIcon from '$lib/components/Icons/StarEmpty.svelte'

    let {
        // actions
        scrollToBottom,
        addReply,
        regenerateReply,
        switchToFork,
        saveChat,

        // events
        onChatUpdated,

        // bindable
        forking_from = $bindable(null),

        // passive
        message,
        is_starred,
        showing_message_info
    } = $props()

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

    const clickedAddReply = () => {
        $is_adding_reply = true

        insertIdIntoOrderedArray(message.parent_id, $forks[$active_fork].forked_at)

        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message.parent_id),
              message_ids = $forks[$active_fork].message_ids.filter(id => id <= message.parent_id)

        $forks       = $forks.concat([{ message_ids, forked_at, provisional: false }])
        $active_fork = $forks.length - 1

        onChatUpdated()
        addReply()
    }

    const clickedRegenerate = async () => {
        if (confirm(`Regenerate this reply?  Press OK to confirm.`)) {
            $is_deleting = true
            await tick()

            const deleted = $forks[$active_fork].message_ids.splice(-1,1)
            $messages   = $messages.filter(m => m.id !== deleted[0])
            $stars      = $stars.filter(m => m.id !== deleted[0])
            $highlights = $highlights.filter(hl => hl.message_id !== deleted[0])
            regenerateReply()

            await tick()
            $is_deleting = false
        }
    }
 
    const clickedDelete = async () => {
        if (confirm(`Delete this message?  Press OK to confirm.`)) {
            $is_deleting = true
            await tick()
            
            const delete_parent_too = !message.has_siblings

            let deleted
            if (delete_parent_too) {
                deleted = $forks[$active_fork].message_ids.splice(-2,2)
            } else {
                deleted = $forks[$active_fork].message_ids.splice(-1,1)
            }

            $messages   = $messages.filter(m => !deleted.includes(m.id))
            $stars      = $stars.filter(id => !deleted.includes(id))
            $highlights = $highlights.filter(hl => !deleted.includes(hl.message_id))

            updateForksAfterDelete()
            onChatUpdated() 
            saveChat()

            // TODO: if $messages.length === 1, delete the chat

            await tick()
            $is_deleting = false
        }
    }

    const updateForksAfterDelete = () => {
        for (let i = 0; i < $forks.length; i++) {
            const fork            = $forks[i],
                  last_forked_at  = fork.forked_at[fork.forked_at.length - 1],
                  last_message_id = fork.message_ids[fork.message_ids.length - 1],
                  last_message    = $messages[last_message_id]

            if (last_message?.role === 'assistant' && last_forked_at === last_message_id) {

                //  If we've deleted messages back to a fork point, (re)set the fork
                //  to provisional.

                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_forked_at)) {
                        forking_from              = _i
                        $forks[i].provisional     = true
                        $is_provisionally_forking = true
                    }
                }
            } else if (last_message?.role === 'user') {

                //  If we've deleted 1 out of 2 replies, so there's now only one
                //  fork left, remove the fork point (`forked_at`) from the one
                //  remaining fork then switch to it.
                //
                //  If we've deleted 1 out of 3+ replies, switch to the closest
                //  sibling fork, e.g.:
                //      - if we've deleted fork 4 of 4, switch to fork 3 of 3.
                //      - if we've deleted fork 1 of 4, switch to fork 2 of 3.
                //      - if we've deleted fork 2 of 4, switch to fork 1 of 3.

                let sibling_indexes = []
                for (let _i = 0; _i < $forks.length; _i++) {
                    if (_i === i) continue
                    if ($forks[_i].forked_at.includes(last_message_id)) sibling_indexes.push(_i)
                }

                if (sibling_indexes.length === 1) {
                    let _i = sibling_indexes[0]
                    $forks[_i].forked_at = $forks[_i].forked_at.filter(id => id !== last_forked_at)
                    if (_i < i) {
                        switchToFork(_i)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(_i - 1)
                    }
                } else if (sibling_indexes.length > 1) {

                    //  find the element closest to i in `sibling_indexes` that
                    //  is less than it.  If there is no such element, use the
                    //  first element.

                    let closest_index = sibling_indexes.reduce((closest, current) => {
                        return (current < i && current > closest) ? current : closest
                    }, sibling_indexes[0])

                    if (closest_index < i) {
                        switchToFork(closest_index)
                        $forks.splice(i, 1)
                    } else {
                        $forks.splice(i, 1)
                        switchToFork(closest_index - 1)
                    }
                }
            }
        }
        $forks = $forks
    }

    const clickedFork = () => {
        if (!$is_idle) return

        $is_provisionally_forking = true
        forking_from              = $active_fork

        insertIdIntoOrderedArray(message.id, $forks[$active_fork].forked_at)

        const forked_at   = $forks[$active_fork].forked_at.filter(id => id <= message.id),
              message_ids = $forks[$active_fork].message_ids.filter(id => id <= message.id)

        $forks       = $forks.concat([{ message_ids, forked_at, provisional: true }])
        $active_fork = $forks.length - 1

        onChatUpdated()
        setTimeout(() => { scrollToBottom({ context: 'new_fork' }) }, 100)
    }

    const clickedStar = () => {
        if (is_starred) {
            $stars = $stars.filter(id => id !== message.id)
            console.log(`⭐️ Unstarred ${message.id}...`)
        } else {
            $stars = [...$stars, message.id]
            console.log(`⭐️ Starred ${message.id}...`)
        }
        saveChat()
    }
</script>

<div class='message-controls-right' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
    {#if message.is_last}
        <button class='message-control-button add' onclick={clickedAddReply} onmouseenter={hoveredAddReply} onmouseleave={unhoveredAddReply}>
            <AddIcon className='icon' />
        </button>
        <button class='message-control-button retry' onclick={clickedRegenerate} onmouseenter={hoveredRegenerate} onmouseleave={unhoveredRegenerate}>
            <RetryIcon className='icon' />
        </button>
        <button class='message-control-button delete' onclick={clickedDelete} onmouseenter={hoveredDelete} onmouseleave={unhoveredDelete}>
            <DeleteIcon className='icon' />
        </button>
    {:else}
        <button class='message-control-button fork' title='Fork' onclick={clickedFork}>
            <ForkFromHereIcon className='icon' />
        </button>
    {/if}
</div>

{#if !showing_message_info}
    <div class='message-controls-left' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
        <button class='message-control-button star' class:starred={is_starred} onclick={clickedStar} onmouseenter={hoveredStar} onmouseleave={unhoveredStar}>
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
                border:          1px solid $background-300
                cursor:          pointer
                transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s

                .icon
                    fill:       $background-200
                    color:      $background-200
                    transition: fill easing.$quart-out 0.1s, color easing.$quart-out 0.1s

                &:hover,
                &:active
                    transition: none

                    .icon
                        fill:       $background-700
                        color:      $background-700
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
                        border-color:     color.mix($background-500, $blue, 5%)
                        background-color: color.mix($background-500, $blue, 5%)

                &.retry
                    .icon
                        height: 18px
                    &:hover
                        border-color:     white
                        background-color: white
                    &:active
                        border-color:     color.mix($background-500, $off-white, 5%)
                        background-color: color.mix($background-500, $off-white, 5%)
                    
                &.delete
                    .icon
                        height: 19px
                    &:hover
                        border-color:     $coral
                        background-color: $coral
                    &:active
                        border-color:     color.mix($background-500, $coral, 5%)
                        background-color: color.mix($background-500, $coral, 5%)

                &.fork
                    .icon
                        height:    13px
                        transform: rotate(45deg)
                    &:hover
                        border-color:     $blue
                        background-color: $blue
                    &:active
                        border-color:     color.mix($background-500, $blue, 5%)
                        background-color: color.mix($background-500, $blue, 5%)

                &.star
                    height: 80px
                    .icon
                        &.empty
                            height: 19px
                            fill:   $background-200
                        &.full
                            display: none
                            height: 19px
                            fill:   $yellow
                    &:hover,
                    &:active
                        border-color:     $background-200
                        background-color: $background-200
                        .icon
                            &.empty
                                display: none
                            &.full
                                display: block
                                height:  19px
                                fill:    $yellow
                    &:active
                        border-color:     color.adjust($background-200, $lightness: -2%)
                        background-color: color.adjust($background-200, $lightness: -2%)
                    &.starred
                        border-color:     $background-700
                        background-color: $yellow
                        .icon
                            &.empty
                                display: none
                            &.full
                                display: block
                                height:  19px
                                fill:    $background-700
                        &:active
                            background-color: color.mix($background-500, $yellow, 5%)
</style>
