<script>
    import all_models from '$lib/fixtures/models'

    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { config } from '$lib/stores/user'

    $: default_model = all_models.find(m => m.id === $config.default_model_id)
</script>

<div class='hover-info-default-model' in:fade={{ delay: 250, duration: 125, easing: quartOut }}>
    <img class='model-icon' src='/img/icons/models/{default_model.icon}' alt='{default_model.name}'>
    <div class='text'>
        <div class='title'>
            Default Model
        </div>
        <div class='description'>
            Click and hold to choose another
        </div>
    </div>
</div>

<style lang='sass'>
    .hover-info-default-model
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px 48px 24px 24px
        border-radius:    8px
        background-color: $off-white
        color:            $background-darkest
        pointer-events:   none
        
        .model-icon
            height: 32px

        .text
            line-height: 24px
            font-size:   16px
            font-weight: 600

            .description
                font-size:   14px
                font-weight: 450
                color:       color.adjust($background-darkest, $alpha: -0.5)
</style>
