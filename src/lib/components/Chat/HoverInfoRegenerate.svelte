<script>
    import { fly, fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { model } from '$lib/stores/ai'

    import RetryIcon from '$lib/components/Icons/Retry.svelte'
</script>

<div class='hover-info-regenerate' in:fly={{ x: 4, duration: 125, easing: quartOut }} out:fade={{ duration: 125, easing: quartOut }}>
    <img class='model-icon' src='/img/icons/models/{$model.icon}' alt='{$model.name}'>
    <span class='text'>
        Regenerate Reply<br>
        <span class='model-name'>
            {$model.name}
        </span>
    </span>
</div>

<style lang='sass'>
    .hover-info-regenerate
        position:         absolute
        bottom:           space.$default-padding
        right:            space.$default-padding
        z-index:          1000
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px 48px 24px 24px
        border-radius:    8px
        background-color: $off-white
        color:            $background-darkest

        :global
            .icon
                height: 19px
                fill:   $background-darkest

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
</style>
