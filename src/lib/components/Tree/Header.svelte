<script>
    import { forks, active_fork } from '$lib/stores/chat'

    const { onClickClose } = $props()
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
    <button class='close-button' onclick={onClickClose}>
        <div class='close-icon'></div>
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
        height:           space.$tree-view-header-height
        background-color: color.adjust($background-800, $lightness: -2%)

    .title
        font-size:      18.5px
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
            font-weight:    500
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
        height:          space.$tree-view-header-height
        padding:         0 space.$default-padding
        cursor:          pointer

        .close-icon
            $size:            16px
            height:           $size
            width:            $size
            mask-image:       url('/img/icons/close.png')
            mask-size:        contain
            mask-repeat:      no-repeat
            mask-position:    center
            background-color: $off-white
        
        &:hover
            .close-icon
                filter: brightness(0.8)
</style>
