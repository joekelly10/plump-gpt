<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'

    let show_text = false
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class='container' on:mouseover={() => { show_text = true }} on:mouseleave={() => { show_text = false }}>
    <img class='logo' src='/img/logo.png' alt='Plump GPT'>
    {#if show_text}
        <!-- separate padding block improves animation vs. padding-left on .text -->
        <div class='padding' transition:slide={{ axis: 'x', duration: 125, easing: quartOut }} />
        <div class='text' in:slide={{ axis: 'x', duration: 250, easing: quartOut }} out:slide={{ axis: 'x', duration: 150, easing: quartOut }}>
            <!-- Thought Fattener -->
            Fatten your thoughts
        </div>
    {/if}
</div>

<style lang='sass'>
    .container
        display:     flex
        align-items: center
        height:      100%
        padding:     0 16px
        cursor:      grab
        transition:  transform 250ms easing.$quart-out

        &:active
            cursor:    grabbing
            transform: scale(0.98)

    .logo
        height: 13px
    
    .padding
        display: inline-block
        width:   12px
    
    .text
        display:     inline-block
        font-size:   14px
        color:       $blue-grey
        white-space: nowrap
</style>
