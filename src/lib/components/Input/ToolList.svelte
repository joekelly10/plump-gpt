<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { screen_width } from '$lib/stores/screen'
    import { tool_list_active } from '$lib/stores/app'
    import { model } from '$lib/stores/ai'
    import breakpoints from '$lib/fixtures/breakpoints'

    import ThinkingBudgetButton from '$lib/components/ToolList/ToggleThinkingBudgetButton.svelte'
    import WebSearchButton from '$lib/components/ToolList/ToggleWebSearchButton.svelte'
    import GoogleSearchButton from '$lib/components/ToolList/ToggleGoogleSearchButton.svelte'
    import XSearchButton from '$lib/components/ToolList/ToggleXSearchButton.svelte'
    import ExaSearchButton from '$lib/components/ToolList/ToggleExaSearchButton.svelte'

    const close = () => {
        $tool_list_active = false
    }
</script>

<section class='tool-list-section'>
    {#if $tool_list_active}
        <div 
            class='tool-list'
            class:position-right={$screen_width < breakpoints.tool_list_position}
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
                    <div class='close-icon'></div>
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
                    {#if $model.tools.includes('reasoning_effort')}
                        <ReasoningEffortButton/>
                    {/if}
                    {#if $model.tools.includes('verbosity')}
                        <VerbosityButton/>
                    {/if}
                    {#if $model.tools.includes('web_search')}
                        <WebSearchButton/>
                    {/if}
                    {#if $model.tools.includes('google_search')}
                        <GoogleSearchButton/>
                    {/if}
                    {#if $model.tools.includes('x_search')}
                        <XSearchButton/>
                    {/if}
                    {#if $model.tools.includes('exa_search')}
                        <div class='tool-group-heading'>
                            Remote MCP
                        </div>
                        <ExaSearchButton/>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</section>

<style lang='sass'>
    $button-size: space.$header-height

    .tool-list-section
        position: absolute
        bottom:   100%
        left:     0
        z-index:  1
        width:    100%

    .tool-list
        display:        flex
        flex-direction: column
        align-items:    center
        position:       absolute
        bottom:         0
        left:           50%
        transform:      translateX(48px)
        width:          520px

        &.position-right
            left:      auto
            right:     space.$default-padding
            transform: none
        
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
                    $size:            14px
                    height:           $size
                    width:            $size
                    mask-image:       url('/img/icons/close.png')
                    mask-size:        contain
                    mask-repeat:      no-repeat
                    mask-position:    center
                    background-color: $off-white
                
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
            background-color: $modal-blur-bg-color
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
