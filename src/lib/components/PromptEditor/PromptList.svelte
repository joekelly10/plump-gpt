<script>
    import { messages } from '$lib/stores/chat'
    import { system_prompts } from '$lib/stores/prompt_editor'

    import PromptListButton from '$lib/components/PromptEditor/PromptListButton.svelte'
    import AddIcon from '$lib/components/Icons/Add.svelte'

    let { selectPrompt, current_prompt_index } = $props()

    let list

    const new_prompt_already_created = $derived(!$system_prompts[0]?.id)

    const createPrompt = async () => {
        if (new_prompt_already_created) {
            selectPrompt(0)
            return
        }

        $system_prompts = [
            {
                id:               null,
                title:            '',
                message:          '',
                original_title:   null,
                original_message: null,
                modified:         true
            },
            ...$system_prompts
        ]

        selectPrompt(0)
        list.scrollTo({ top: 0, behavior: 'smooth' })
    }
</script>

<div class='prompt-list'>
    <div class='header'>
        <div class='text'>
            System Prompts
            <span class='bull'>
                &bull;
            </span>
            {$system_prompts.length}
        </div>
        <button class='create-button' onclick={createPrompt}>
            <AddIcon className='icon' />
        </button>
    </div>
    <div class='list' bind:this={list}>
        {#each $system_prompts as prompt, i (prompt.id)}
            <PromptListButton
                prompt={prompt}
                index={i}
                selected={i === current_prompt_index}
                active={prompt.id === $messages[0].system_prompt_id}
                selectPrompt={selectPrompt}
            />
        {/each}
    </div>
</div>

<style lang='sass'>
    .prompt-list
        display:         flex
        flex-direction:  column
        align-items:     center
        justify-content: flex-start
        position:        absolute
        top:             0
        left:            0
        width:           space.$prompt-editor-list-width
        height:          100vh

    .header
        display:          flex
        align-items:      center
        justify-content:  space-between
        width:            100%
        height:           space.$prompt-editor-header-height
        flex-shrink:      0
        box-sizing:       border-box
        padding:          0 space.$default-padding
        border-bottom:    1px solid black(0.1)
        background-color: $background-800
        font-size:        16px
        font-weight:      600
        color:            $off-white

        .text
            .bull
                margin: 0 8px
                color:  $yellow

        .create-button
            display:         flex
            align-items:     center
            justify-content: center
            width:           40px
            height:          40px
            border-radius:   8px
            border:          1px solid $background-300
            color:           $background-200
            cursor:          pointer
            transition:      border-color easing.$quart-out 0.125s, background-color easing.$quart-out 0.125s, color easing.$quart-out 0.125s

            :global(.icon)
                height:    11px
                transform: rotate(45deg)
                
            &:hover
                border-color:     $yellow
                background-color: $yellow
                color:            $background-800
                transition:       none
        
            &:active
                border-color:     color.adjust($yellow, $lightness: -10%)
                background-color: color.adjust($yellow, $lightness: -10%)
                color:            $background-800
                transition:       none

    .list
        display:          flex
        flex-direction:   column
        align-items:      flex-start
        justify-content:  flex-start
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        padding-bottom:   space.$default-padding * 3
        background-color: $background-800
        overflow-y:       auto
        overflow-x:       hidden
        +shared.scrollbar
</style>
