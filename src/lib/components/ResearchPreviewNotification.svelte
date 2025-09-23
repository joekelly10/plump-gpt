<script>
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { browser } from '$app/environment'

    let should_show_notification = $state(false),
        checkbox                 = $state(null)

    onMount(() => {
        if (browser && window.location.hostname !== 'localhost') {
            const dismissed = localStorage.getItem('research_preview_dismissed')
            if (dismissed !== 'true') should_show_notification = true
        }
    })

    const clicked = () => {
        should_show_notification = false
        if (checkbox.checked) localStorage.setItem('research_preview_dismissed', 'true')
    }
</script>

{#if should_show_notification}
    <div class='research-preview-notification' transition:fade={{ duration: 125, easing: quartOut }}>
        <div class='inner'>
            <div class='header'>
                <img class='logo' src='/img/logo.png' alt='Plump GPT' />
                <div class='subtitle'>
                    Research Preview
                </div>
            </div>
            <div class='notification-text'>
                <p>
                    This is a research preview for demonstration purposes. You won't be able to send messages unless the API keys have been activated for you &mdash; ask Joe (<a href='mailto:hi@joekel.ly'>hi@joekel.ly</a>)
                </p>
            </div>
        </div>
        <div class='actions'>
            <button class='button' onclick={clicked}>
                Ok, got it
            </button>
            <div class='checkbox'>
                <input type='checkbox' id='checkbox' bind:this={checkbox} />
                <label for='checkbox' class='label'>
                    Don't show this again
                </label>
            </div>
        </div>
    </div>
{/if}

<style lang='sass'>
    .research-preview-notification
        display:          flex
        flex-direction:   column
        align-items:      center
        justify-content:  center
        position:         fixed
        top:              0
        left:             0
        width:            100%
        height:           100%
        background-color: color.adjust($background-700, $alpha: -0.125)
        backdrop-filter:  blur(4px)
        z-index:          9999

        .inner
            width: 480px
        
        .header
            display:        flex
            flex-direction: column
            align-items:    center
            gap:            24px

            .logo
                height: 32px
            
            .subtitle
                font-size:   18px
                font-weight: 500
                color:       $blue-grey
        
        .notification-text
            margin-top:    64px
            margin-bottom: 64px
        
        .actions
            display:        flex
            flex-direction: column
            align-items:    center
            gap:            24px

            .button
                position:         relative
                min-width:        320px
                box-sizing:       border-box
                padding:          20px 24px
                border-radius:    88px
                border:           1px solid $background-700
                background-color: $off-white
                font-weight:      600
                color:            $background-800
                cursor:           pointer

                &:hover
                    background-color: color.adjust($off-white, $lightness: -1%)

                &:active
                    background-color: color.adjust($off-white, $lightness: -2%)
                    top:              0.5px
                    left:             0.5px
            
            .checkbox
                display:        flex
                align-items:    center
                gap:            8px

                #checkbox
                    cursor: pointer

                .label
                    font-size:   14px
                    font-weight: 450
                    color:       $blue-grey
                    cursor:      pointer
</style>
