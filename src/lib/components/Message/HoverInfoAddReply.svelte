<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'
</script>

<div class='hover-info-add-reply' in:fly={{ x: 4, duration: 125, easing: quartOut }} out:fade={{ duration: 75, easing: quartOut }}>
    <img class='model-icon' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
    <span class='text'>
        Add Another Reply<br>
        <span class='model-name'>
            {$model.name}
        </span>
    </span>
</div>

<style lang='sass'>
    .hover-info-add-reply
        position:         absolute
        bottom:           32px
        right:            32px
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px 48px 24px 24px
        border-radius:    8px
        background-color: $blue
        color:            $background-800

    .model-icon
        height: 32px

    .text
        line-height: 24px
        font-size:   16px
        font-weight: 600

        .model-name
            font-size:   14px
            font-weight: 450
            color:       color.adjust($background-800, $alpha: -0.5)
</style>
