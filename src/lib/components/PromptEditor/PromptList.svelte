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
        {$system_prompts.length} prompts
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
        width:           390px
        height:          space.$edit-prompt-form-height + 128px

    .header
        display:          flex
        align-items:      center
        justify-content:  space-between
        width:            100%
        box-sizing:       border-box
        padding:          20px space.$default-padding
        border-radius:    8px 8px 0 0
        background-color: $background-800
        font-weight:      600
        color:            $off-white

        :global
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

                .icon
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
        border-radius:    0 0 8px 8px
        border:           1px solid $background-800
        background-color: color.adjust($background-800, $alpha: -0.67)
        overflow-y:       auto
        overflow-x:       hidden
        &::-webkit-scrollbar
            width:            0px
            height:           0px
            background-color: transparent
        &::-webkit-scrollbar-thumb
            background-color: transparent
            &:hover
                background-color: transparent
            &:active
                background-color: transparent
        &::-webkit-scrollbar-corner
            display: none
</style>
