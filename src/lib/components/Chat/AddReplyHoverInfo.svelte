<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
</script>

<div class='add-reply-hover-info' in:fly={{ y: 5, duration: 200, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
    <img class='model-icon' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
    <span class='text'>
        Add Reply<br>
        <span class='model-name'>
            {$model.name}
        </span>
    </span>
    <span class='arrow'>
        &rarr;
    </span>
</div>

<style lang='sass'>
    .add-reply-hover-info
        position:         absolute
        bottom:           space.$default-padding
        right:            space.$default-padding
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px
        border-radius:    8px
        background-color: $blue
        color:            $background-darkest

    .model-icon
        height: 32px

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600

        .model-name
            font-size:   14px
            font-weight: 450
            color:       color.adjust($background-darkest, $alpha: -0.5)

    .arrow
        font-size:   20px
        font-weight: 600
</style>
