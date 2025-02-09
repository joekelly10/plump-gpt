<span class='waiting-dots'><span class='dot-1'>.</span><span class='dot-2'>.</span><span class='dot-3'>.</span></span>

<style lang='sass'>
    .waiting-dots
        display: inline-block
        .dot-1
            animation: dot-blink-1 2s linear infinite
        .dot-2
            animation: dot-blink-2 2s linear infinite
        .dot-3
            animation: dot-blink-3 2s linear infinite

    @keyframes dot-blink-1
        0%
            opacity: 0
        20%
            opacity: 0
        25%
            opacity: 1
        95%
            opacity: 1
        100%
            opacity: 0

    @keyframes dot-blink-2
        0%
            opacity: 0
        35%
            opacity: 0
        40%
            opacity: 1
        95%
            opacity: 1
        100%
            opacity: 0

    @keyframes dot-blink-3
        0%
            opacity: 0
        50%
            opacity: 0
        55%
            opacity: 1
        95%
            opacity: 1
        100%
            opacity: 0
</style>
