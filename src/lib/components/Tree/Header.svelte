<script>
    import { createEventDispatcher } from 'svelte'
    import { active_fork, forks } from '$lib/stores/chat.js'

    const dispatch = createEventDispatcher()

    const close = () => dispatch('close')
</script>

<div class='header'>
    <div class='title'>
        Tree View
        <span class='bull'>
            //
        </span>
        <span class='fork-text'>
            Fork {$active_fork + 1} / {$forks.length}
        </span>
    </div>
    <button class='close-button' on:click={close}>
        <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
    </button>
</div>

<style lang='sass'>
    .header
        display:          flex
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        z-index:          100
        width:            100%
        height:           space.$header-height
        background-color: color.adjust($background-darkest, $lightness: -2%)

    .title
        font-size:      17px
        font-weight:    900
        text-transform: uppercase
        line-height:    25px

        .bull
            margin:         0 10px
            font-weight:    900
            letter-spacing: 0.5px
            color:          $blue

        .fork-text
            font-size:      14px
            font-weight:    400
            color:          $blue-grey
            text-transform: none

    .close-button
        display:         flex
        align-items:     center
        justify-content: center
        position:        fixed
        top:             0
        right:           0
        z-index:         101
        height:          space.$header-height
        padding:         0 space.$default-padding
        cursor:          pointer

        .close-icon
            height: 16px
        
        &:hover
            .close-icon
                filter: brightness(0.8)
</style>
