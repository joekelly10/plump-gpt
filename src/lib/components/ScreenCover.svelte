<div class='screen-cover'>
    <div class='icon no-mobile-icon'></div>
    <div class='message'>
        <div class='large'>
            Embiggen thy screen, human
        </div>
        <div class='small'>
            Plump GPT is for desktop
        </div>
    </div>
</div>

<style lang='sass'>
    .screen-cover
        display:          flex
        flex-direction:   column
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        z-index:          9999
        width:            100vw
        height:           100vh
        background-color: color.adjust($background-800, $alpha: -0.125)
        transform:        scale(1.02)
        filter:           none
        opacity:          1
        backdrop-filter:  blur(4px)
        pointer-events:   auto
        transition:       transform easing.$quart-out 0.2s, filter easing.$quart-out 0.2s, opacity easing.$quart-out 0.2s

    .icon
        $size:            72px
        margin-bottom:    space.$default-padding
        height:           $size
        width:            $size
        mask-image:       url('/img/icons/no-mobile.png')
        mask-size:        contain
        mask-repeat:      no-repeat
        mask-position:    center
        background-color: $off-white
    
    .message
        text-align:  center
        font-weight: 450
        color:       white

        .small
            margin-top: 16px
            font-size:  14px
            color:      $blue

    @media (min-width: breakpoint.$cover-at-width) and (min-height: breakpoint.$cover-at-height)
        .screen-cover
            transform:      none
            filter:         blur(4px)
            opacity:        0
            pointer-events: none
            transition:     transform easing.$quart-out 0.1s, filter easing.$quart-out 0.1s, opacity easing.$quart-out 0.1s
</style>
