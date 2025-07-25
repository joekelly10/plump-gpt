<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { config } from '$lib/stores/user'
    import all_models from '$lib/fixtures/models'

    import StarIcon from '$lib/components/Icons/Star.svelte'

    const default_model = $derived(all_models.find(m => m.id === $config.default_model_id))
</script>

<div class='hover-info-default-model' in:fade={{ delay: 250, duration: 125, easing: quartOut }}>
    <StarIcon className='star-icon' />
    <div class='text'>
        <div class='title'>
            Default Model
        </div>
        <div class='description'>
            Click and hold to set
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
        background-color: $blue
        background-image: linear-gradient(to bottom right, color.adjust($off-white, $alpha: -0.9), transparent)
        color:            $background-800
        pointer-events:   none

        :global(.star-icon)
            height: 23px
            fill:   $yellow

        .text
            line-height: 24px
            font-size:   16px
            font-weight: 600

            .description
                font-size:   14px
                font-weight: 450
                color:       color.adjust($background-800, $alpha: -0.5)
</style>
