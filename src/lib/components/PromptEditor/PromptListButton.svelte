<script>
    import { fly, slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { save_status } from '$lib/stores/prompt_editor'

    let {
        // actions
        selectPrompt,

        // passive
        prompt,
        index,
        selected,
        active
    } = $props()

    const excerpt      = $derived(prompt.message.length < 100 ? prompt.message : prompt.message.substring(0,99) + '...'),
          provisional  = $derived(!prompt.id),
          in_duration  = $derived(prompt.id ? 0 : $save_status === 'idle' ? 125 : 0), //  don't animate when a new prompt is being saved, just insta-switch
          out_duration = $derived($save_status === 'idle' ? 250 : 0)

    const clicked = () => {
        selectPrompt(index)
    }
</script>

<button
    class='prompt-list-button'
    class:selected={selected}
    class:provisional={provisional}
    class:modified={prompt.modified}
    class:delete-highlight={prompt.delete_highlight}
    onclick={clicked}
    in:fly={{ x: -24, opacity: 0, delay: 100, duration: in_duration, easing: quartOut }}
    out:slide={{ duration: out_duration, easing: quartOut }}
>
    <div class='title'>
        {#if prompt.title}
            {prompt.title}
        {:else}
            <span class='untitled-prompt-text'>
                Untitled Prompt
            </span>
        {/if}
    </div>
    <div class='tags'>
        {#if prompt.default}
            <span class='tag default-tag'>
                default
            </span>
        {/if}
        {#if active}
            <span class='tag active-tag'>
                using now
            </span>
        {/if}
        {#if provisional}
            <span class='tag provisional-tag'>
                new
            </span>
        {:else if prompt.modified}
            <span class='tag modified-tag'>
                modified
            </span>
        {/if}
    </div>
    <div class='message'>
        {excerpt.trim().length > 0 ? excerpt : '...'}
    </div>
</button>

<style lang='sass'>
    .prompt-list-button
        position:         relative
        margin-bottom:    space.$default-padding
        width:            100%
        box-sizing:       border-box
        padding:          30px space.$default-padding
        border-radius:    10px
        background-color: $background-300
        color:            $off-white
        text-align:       left
        cursor:           pointer

        .title
            font-size:   16px
            font-weight: 600
            line-height: 26px
            color:       $yellow

            .untitled-prompt-text
                font-style:  italic
                font-weight: 500
                color:       $blue-grey

        .tags
            margin-top: 6px

            .tag
                display:          inline-block
                margin-right:     4px
                padding:          0 4px
                border-radius:    4px
                background-color: $off-white
                font-size:        10.5px
                font-weight:      700
                text-transform:   uppercase
                line-height:      17px
                color:            $background-800

                &.default-tag
                    background-color: $blue-grey

                &.active-tag
                    background-color: $off-white

                &.modified-tag
                    background-color: $yellow

                &.provisional-tag
                    background-color: $yellow

        .message
            margin-top:  12px
            line-height: font.$line-height-14px
            font-size:   14px

        &:hover
            background-color: color.adjust($background-300, $lightness: 1.25%)
            transition:       none

        &:active
            background-color: color.adjust($background-300, $lightness: 0.75%)

        &.selected
            box-shadow: 0 0 0 1.5px $blue inset

            &.provisional
                box-shadow: 0 0 0 1.5px $yellow inset

                &.delete-highlight
                    box-shadow: 0 0 0 1.5px $coral inset
        
        &.delete-highlight
            box-shadow:       0 0 0 1.5px $coral
            background-color: $delete-highlight-bg
            text-decoration:  line-through
</style>
