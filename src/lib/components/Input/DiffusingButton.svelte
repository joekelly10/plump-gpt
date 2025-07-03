<script>
    import { diffusing_on } from '$lib/stores/ai'

    const clicked = (e) => {
        e.preventDefault()
        $diffusing_on = !$diffusing_on
    }

    const rightClicked = (e) => {
        e.preventDefault()
        $diffusing_on = !$diffusing_on
    }
</script>

<button class='diffusing-button' onclick={clicked} oncontextmenu={rightClicked}>
    <img class='icon' src='/img/icons/diffusing-grey.png' alt='Diffusing' />
    <div class='title'>
        Diffusing
    </div>
    <div class='value'>
        {$diffusing_on ? 'on' : 'off'}
    </div>
</button>

<style lang='sass'>
    .diffusing-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: flex-start
        align-items:     center
        gap:             16px
        padding:         16px
        font-size:       12px
        color:           $blue-grey
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s

        .icon
            height: 16px

        .title
            font-weight:    600
            text-transform: uppercase

        .value
            font-weight:    450
            text-transform: uppercase

        &:hover
            background-color: black(0.1)
            color:            $off-white

            .icon
                filter: brightness(2)
        
        &:active
            background-color: black(0.125)
            color:            $off-white
            transition:       none

            .icon
                filter: brightness(2)
</style>
