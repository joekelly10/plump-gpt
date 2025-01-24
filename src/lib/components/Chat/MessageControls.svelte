<script>
    import { createEventDispatcher, tick } from 'svelte'
    import { slide, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { messages } from '$lib/stores/chat'
    import { model } from '$lib/stores/ai'

    const dispatch = createEventDispatcher()

    export let message,
               starred,
               showing_message_info

    $: parent_index = $messages.findIndex(m => m.id === message.parent_id)

    const hoveredDelete = async () => {
        if (message.has_siblings) {
            $messages[parent_index].delete_fork_highlight = true
        } else {
            $messages[parent_index].delete_highlight = true
        }
        await tick()
        message.delete_highlight = true
    }

    const unhoveredDelete = async () => {
        if (parent_index === -1) return
        $messages[parent_index].delete_highlight      = false
        $messages[parent_index].delete_fork_highlight = false
        await tick()
        message.delete_highlight = false
    }

    const hoveredRegenerate = async () => {
        $messages[parent_index].regenerate_highlight = true
        await tick()
        message.regenerate_highlight = true
    }

    const unhoveredRegenerate = async () => {
        if (parent_index === -1) return
        $messages[parent_index].regenerate_highlight = false
        await tick()
        message.regenerate_highlight = false
    }

    const hoveredAddReply = async () => {
        $messages[parent_index].add_reply_highlight = true
        await tick()
        message.add_reply_highlight = true
    }
    
    const unhoveredAddReply = async () => {
        $messages[parent_index].add_reply_highlight = false
        await tick()
        message.add_reply_highlight = false
    }

    const clickedAddReply   = () => dispatch('addReply', { message_id: message.parent_id })
    const clickedRegenerate = () => dispatch('regenerateReply')
    const clickedDelete     = () => dispatch(message.has_siblings ? 'deleteOne' : 'deleteBoth')
    const clickedFork       = () => dispatch('forkFrom', { message_id: message.id })
    const clickedStar       = () => dispatch('toggleStar')
</script>

<div class='message-controls-right' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
    {#if message.is_last}
        <button class='message-control-button add' title='Add another reply' on:click={clickedAddReply} on:mouseenter={hoveredAddReply} on:mouseleave={unhoveredAddReply}>
            <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
            <div class='model-container'>
                <img class='avatar' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
            </div>
        </button>
        <button class='message-control-button retry' title='Regenerate reply' on:click={clickedRegenerate} on:mouseenter={hoveredRegenerate} on:mouseleave={unhoveredRegenerate}>
            <svg class='icon' enable-background='new 0 0 24 24' viewBox='0 0 24 24' id='retry'><path d='M21,11c-0.6,0-1,0.4-1,1c0,2.9-1.5,5.5-4,6.9c-3.8,2.2-8.7,0.9-10.9-2.9C2.9,12.2,4.2,7.3,8,5.1c3.3-1.9,7.3-1.2,9.8,1.4 h-2.4c-0.6,0-1,0.4-1,1s0.4,1,1,1h4.5c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1.8C17,3,14.6,2,12,2C6.5,2,2,6.5,2,12 s4.5,10,10,10c5.5,0,10-4.5,10-10C22,11.4,21.6,11,21,11z'></path></svg>
        </button>
        <button class='message-control-button delete' title='Delete message' on:click={clickedDelete} on:mouseenter={hoveredDelete} on:mouseleave={unhoveredDelete}>
            <svg class='icon' viewBox='0 0 7 7'><path d='m.5.5 6 6m0-6-6 6' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round'/></svg>
        </button>
    {:else}
        <button class='message-control-button fork' title='Fork' on:click={clickedFork}>
            <svg class='icon' viewBox='22 30 53 40'><path d='M74.191 50.855a2.3 2.3 0 0 0 .168-.855c0-.301-.063-.59-.168-.856l-.012-.035a2.3 2.3 0 0 0-.508-.766l-17.676-17.68a2.343 2.343 0 0 0-3.312 3.313l13.676 13.68H24.671a2.345 2.345 0 0 0 0 4.688h41.688L52.683 66.018a2.343 2.343 0 0 0 3.312 3.313l17.676-17.676q.331-.33.508-.766c.008-.011.008-.023.012-.035z'/></svg>
        </button>
    {/if}
</div>

{#if !showing_message_info}
    <div class='message-controls-left' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:fade={{ duration: 250, easing: quartOut }}>
        <button class='message-control-button star' class:starred={starred} title='Star' on:click={clickedStar}>
            <svg class='icon empty' viewBox='0 -1 34 34'><path d='M18.05.242c.466.226.843.596 1.073 1.054L23.1 9.194l8.874 1.276c1.294.186 2.19 1.368 2 2.64a2.3 2.3 0 0 1-.688 1.327l-6.416 6.157 1.507 8.687c.22 1.267-.647 2.47-1.936 2.685a2.4 2.4 0 0 1-1.499-.233L17 27.64l-7.942 4.093c-1.159.597-2.59.159-3.198-.98a2.3 2.3 0 0 1-.238-1.472l1.508-8.687-6.416-6.157a2.3 2.3 0 0 1-.04-3.29 2.4 2.4 0 0 1 1.352-.677L10.9 9.194l3.977-7.898c.58-1.152 2-1.624 3.173-1.054M12.472 11.32 2.369 12.772l7.305 7.01-1.717 9.89L17 25.012l9.042 4.66-1.716-9.89 7.305-7.01-10.103-1.452L17 2.328z'/></svg>
            <svg class='icon full' viewBox='0 0 48 48' xml:space='preserve'><g stroke-width='0'/><g stroke-linecap='round' stroke-linejoin='round'/><path d='m26.285 2.486 5.407 10.956a2.58 2.58 0 0 0 1.944 1.412l12.091 1.757c2.118.308 2.963 2.91 1.431 4.403l-8.749 8.528a2.58 2.58 0 0 0-.742 2.285l2.065 12.042c.362 2.109-1.852 3.717-3.746 2.722l-10.814-5.685a2.59 2.59 0 0 0-2.403 0l-10.814 5.685c-1.894.996-4.108-.613-3.746-2.722l2.065-12.042a2.58 2.58 0 0 0-.742-2.285L.783 21.014c-1.532-1.494-.687-4.096 1.431-4.403l12.091-1.757a2.58 2.58 0 0 0 1.944-1.412l5.407-10.956c.946-1.919 3.682-1.919 4.629 0'/></svg>
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
            .model-container
                display:          flex
                align-items:      center
                justify-content:  center
                position:         absolute
                top:              0
                left:             -1px
                transform:        translateY(-20px) scale(0.5)
                width:            $button-size
                height:           $button-size
                box-sizing:       border-box
                opacity:          0
                pointer-events:   none
                transition:       opacity 0.1s easing.$quart-out, transform 0.1s easing.$quart-out

                .avatar
                    height: 21px

            .icon
                height:    11px
                transform: rotate(45deg)

            &:hover
                border-color:     $blue
                background-color: $blue

                .model-container
                    transform:      translateY(-50px)
                    opacity:        1
                    pointer-events: all
                    transition:     opacity 0.1s easing.$quart-out, transform 0.1s easing.$quart-out

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

                .model-container
                    .avatar
                        height: 19px

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
                height: 12.5px
            &:hover
                border-color:     $coral
                background-color: $coral
            &:active
                border-color:     color.adjust($coral, $lightness: -4%)
                background-color: color.adjust($coral, $lightness: -4%)

        &.fork
            .icon
                height:    13.5px
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
