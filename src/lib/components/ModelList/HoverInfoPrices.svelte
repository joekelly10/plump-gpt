<script>
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
</script>

<div class='hover-info-prices' in:fade={{ delay: 250, duration: 125, easing: quartOut }}>
    <div class='icon'>
        💵
    </div>
    <div class='text'>
        <div class='title'>
            Input / Output Prices
        </div>
        <div class='description'>
            Per million tokens
        </div>
    </div>
</div>

<style lang='sass'>
    .hover-info-prices
        display:          flex
        align-items:      center
        gap:              24px
        padding:          24px 48px 24px 24px
        border-radius:    8px
        background-color: $blue
        background-image: linear-gradient(to bottom right, color.adjust($off-white, $alpha: -0.9), transparent)
        color:            $background-800
        
        .icon
            font-size: 24px

        .text
            line-height: 24px
            font-size:   16px
            font-weight: 600

            .description
                font-size:   14px
                font-weight: 450
                color:       color.adjust($background-800, $alpha: -0.5)
</style>
