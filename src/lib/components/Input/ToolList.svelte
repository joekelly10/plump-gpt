<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { tool_list_active } from '$lib/stores/app'
    import { model } from '$lib/stores/ai'

    import ThinkingBudgetButton from '$lib/components/ToolList/Anthropic/ToggleThinkingBudgetButton.svelte'
    import WebSearchButton from '$lib/components/ToolList/ToggleWebSearchButton.svelte'

    const close = () => {
        $tool_list_active = false
    }
</script>

<section class='tool-list-section'>
    {#if $tool_list_active}
        <div 
            class='tool-list'
            in:slide={{ axis: 'y', duration: 200, easing: quartOut }}
            out:slide={{ axis: 'y', duration: 125, easing: quartOut }}
        >
            <div class='header'>
                <div class='title'>
                    Tools
                    <span class='bull'>
                        &bull;
                    </span>
                    {$model.tools.length}
                </div>
                <button class='close-button' onclick={close}>
                    <img class='close-icon' src='/img/icons/close-white.png' alt='Close'>
                </button>
            </div>
            <div class='list'>
                <div class='tool-group native-tools'>
                    <div class='tool-group-heading'>
                        {$model.family} API
                    </div>
                    {#if $model.type === 'anthropic' && $model.is_reasoner}
                        <ThinkingBudgetButton/>
                    {/if}
                    {#if $model.tools.includes('web_search')}
                        <WebSearchButton/>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</section>

<style lang='sass'>
    $button-size: space.$header-height

    .tool-list-section
        display:        flex
        flex-direction: column
        align-items:    center
        position:       absolute
        bottom:         100%
        left:           0
        z-index:        1
        width:          100%

    .tool-list
        display:        flex
        flex-direction: column
        align-items:    center
        position:       absolute
        bottom:         0
        left:           50%
        transform:      translateX(48px)
        width:          512px
        
        .header
            display:          flex
            align-items:      center
            flex-shrink:      0
            width:            100%
            height:           space.$header-height
            box-sizing:       border-box
            border-radius:    12px 12px 0 0
            background-color: $background-700

            .title
                padding:     0 space.$default-padding
                font-size:   14px
                font-weight: 600

                .bull
                    margin: 0 5px
                    color:  $blue
            
            .close-button
                display:         flex
                align-items:     center
                justify-content: center
                position:        absolute
                top:             0
                right:           0
                z-index:         10
                width:           space.$header-height + 12px
                height:          space.$header-height
                cursor:          pointer
                
                .close-icon
                    height: 14px
                
                &:hover
                    .close-icon
                        filter: brightness(0.8)

        .list
            display:          flex
            flex-direction:   column
            align-items:      flex-start
            justify-content:  flex-start
            width:            100%
            box-sizing:       border-box
            padding-bottom:   24px
            border-left:      1px solid $background-700
            border-right:     1px solid $background-700
            background-color: color.adjust(color.adjust($background-500, $lightness: -1%), $alpha: -0.05)
            backdrop-filter:  blur(4px)
            +shared.scrollbar
        
        .tool-group
            display:         flex
            flex-direction:  column
            align-items:     flex-start
            justify-content: flex-start
            width:           100%

        .tool-group-heading
            width:            100%
            box-sizing:       border-box
            padding:          24px
            border-bottom:    1px solid $background-700
            font-size:        12px
            font-weight:      600
            color:            $blue-grey
            text-align:       center
            text-transform:   uppercase
</style>
