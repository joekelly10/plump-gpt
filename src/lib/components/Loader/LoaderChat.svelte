<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { chat_id } from '$lib/stores/chat'
    import { avatar_href } from '$lib/stores/user'
    import { formatDate } from '$lib/utils/helpers'
    import { marked } from 'marked'

    import StarIcon from '$lib/components/Icons/Star.svelte'
    import HighlightIcon from '$lib/components/Icons/Highlight.svelte'
    import DeleteIcon from '$lib/components/Icons/Delete.svelte'

    marked.use({ mangle: false, headerIds: false })

    let {
        // actions
        loadChat,
        deleteChat,

        // passive
        chat,
        index,
        keyboard_index,
        suspend_mouse
    } = $props()

    const content            = $derived(chat.messages[1].content.length < 500 ? chat.messages[1].content : chat.messages[1].content.substring(0, 500) + '...'),
          assistant_messages = $derived(chat.messages.filter(m => m.role === 'assistant')),
          models_used        = $derived(getModelsUsed(assistant_messages)),
          out_duration       = $derived(chat.deleting ? 250 : 0)

    const getModelsUsed = (assistant_messages) => {
        let models = []

        assistant_messages.forEach(message => {
            const index = models.findIndex(m => m.id === message.model.id)
            if (index === -1) {
                models.push({ ...message.model, count: 1 })
            } else {
                models[index].count++
            }
        })

        return models
    }

    const onmouseenterDeleteButton = () => {
        chat.deleting = true
    }

    const onmouseleaveDeleteButton = () => {
        chat.deleting = false
    }
</script>

<div class='loader-chat-container' out:slide={{ duration: out_duration, easing: quartOut }}>
    <button class='loader-chat'
        class:keyboard-highlight={index === keyboard_index}
        class:delete-highlight={chat.deleting}
        class:suspend-mouse-highlight={suspend_mouse}
        class:selected={chat.selected}
        onclick={() => loadChat(chat)}
    >
        <div class='date'>
            {@html formatDate(chat.updated_at)}
            {#if chat.id === $chat_id}
                <span class='active'>
                    (active now)
                </span>
            {/if}
        </div>

        <div class='stars-and-highlights'>
            {#if chat.stars?.length > 0}
                <div class='star-count'>
                    <StarIcon className='icon' />
                    {chat.stars.length}
                </div>
            {/if}
            {#if chat.highlights?.length > 0}
                <div class='highlight-count'>
                    <HighlightIcon className='icon' />
                    {chat.highlights.length}
                </div>
            {/if}
        </div>

        <div class='keyboard-tip'>
            Press <span class='key'>Enter</span>
        </div>

        <div class='message'>
            <div class='author-container'>
                <img class='avatar user' src={$avatar_href} alt='User'>
            </div>
            {#if !chat.messages[0].is_default}
                <div class='system-prompt'>
                    System prompt
                    <div class='system-prompt-title'>
                        {chat.messages[0].system_prompt_title}
                    </div>
                </div>
            {/if}
            <div class='content'>
                {@html marked(content)}
            </div>
        </div>

        <div class='message-count'>
            <div class='models-used'>
                {#each models_used as model}
                    <div class='model'>
                        <img class='ai-icon' src='/img/icons/models/{model.icon ?? 'gpt-4.1-mini.png'}' alt='{model.name}' title='{model.name} ({model.count})'>
                    </div>
                {/each}
            </div>
            <span class='message-count'>
                {assistant_messages.length} {assistant_messages.length === 1 ? 'response' : 'responses'}
            </span>
            {#if chat.forks.length > 1}
                <span class='fork-count'>
                    <span class='bull'>&bull;</span>
                    {chat.forks.length} forks
                </span>
            {/if}
        </div>
    </button>
    <div class='actions'>
        <button
            class='action-button delete'
            title='Delete chat'
            onmouseenter={onmouseenterDeleteButton}
            onmouseleave={onmouseleaveDeleteButton}
            onclick={() => deleteChat(chat)}
        >
            <DeleteIcon className='icon' />
        </button>
    </div>
</div>

<style lang='sass'>
    .loader-chat-container
        position:      relative
        margin-bottom: space.$default-padding

    .loader-chat
        width:            100%
        box-sizing:       border-box
        padding:          space.$default-padding
        box-shadow:       0 0 0 0 transparent
        border-radius:    8px
        border:           1px solid $background-300
        background-color: $background-300
        text-align:       left
        cursor:           pointer
        transition:       box-shadow easing.$quart-out 0.125s, background-color easing.$quart-out 0.125s
        +shared.code_block_styles

        &:not(.suspend-mouse-highlight)
            &:hover
                box-shadow: 0 0 0 1.5px $off-white inset
                transition: none

                &.keyboard-highlight
                    box-shadow: 0 0 0 2px $blue, 0 0 0 1.5px $off-white inset

        &:active
            background-color: color.adjust($background-300, $lightness: -1%)
        
        &.keyboard-highlight
            box-shadow: 0 0 0 2px $blue
            transition: none

            .keyboard-tip
                opacity:    1
                transition: opacity easing.$quart-out 0.125s
    
        &.selected
            background-color: color.adjust($background-300, $lightness: -2%)

        &.delete-highlight
            box-shadow:       0 0 0 1.5px $coral
            border-color:     $delete-highlight-bg
            background-color: $delete-highlight-bg
            color:            $delete-highlight-color
            text-decoration:  line-through
            transition:       background-color easing.$quart-out 0.050s, box-shadow easing.$quart-out 0.050s

    .date
        margin-bottom: space.$default-padding
        font-weight:   450
        color:         $blue-grey
        
        :global(.bull)
            margin:      0 3px
            font-weight: 700
        
        .active
            margin-left: 8px
            color:       $pale-blue

    .keyboard-tip
        position:    absolute
        top:         0
        left:        100%
        margin-top:  space.$default-padding
        margin-left: space.$default-padding
        font-size:   14px
        font-weight: 450
        color:       $blue
        white-space: nowrap
        opacity:     0
        transition:  none

        .key
            font-size:      12px
            font-weight:    700
            text-transform: uppercase

    .message
        $container-width: 64px
        position:     relative
        padding-left: $container-width

        .author-container
            position:   absolute
            top:        0
            left:       0
            width:      $container-width
            text-align: left

            .avatar
                height: 32px

                &.user
                    border-radius: 8px
        
        .system-prompt
            margin-bottom:    space.$default-padding
            padding:          24px
            border-radius:    6px
            background-color: black(0.2)
            font-size:        14px
            font-weight:      450
            color:            $blue-grey
            text-align:       center

            .system-prompt-title
                margin-top:  6px
                font-size:   16px
                font-weight: 600
                color:       $off-white
        
        .content
            overflow-wrap: anywhere
    
    .message-count
        margin-top:  space.$default-padding
        text-align:  right
        font-weight: 450
        color:       $blue-grey

        .models-used
            $icon-size:      32px
            $gap-size:       12px
            $per-line:       8
            display:         inline-flex
            flex-wrap:       wrap
            gap:             $gap-size
            justify-content: flex-end
            vertical-align:  bottom
            margin-right:    20px
            margin-bottom:   -4px
            max-width:       $per-line * $icon-size + ($per-line - 1) * $gap-size

            .model
                display:  inline-block
                position: relative

                &:hover
                    .ai-icon
                        transform:  scale(1.1)
                        transition: none
            
            .ai-icon
                display:        inline-block
                vertical-align: middle
                margin-top:     -3px
                height:         $icon-size
                transition:     transform easing.$quart-out 0.125s

    .fork-count
        .bull
            margin: 0 5px
    
    .stars-and-highlights
        display:        flex
        flex-direction: column
        align-items:    center
        gap:            16px
        position:       absolute
        top:            space.$default-padding - 8px
        right:          100%
        margin-right:   space.$default-padding
        width:          64px
        user-select:    none

        .star-count,
        .highlight-count
            display:       flex
            align-items:   center
            gap:           9px
            width:         100%
            height:        35px
            box-sizing:    border-box
            padding:       0 12px
            border-radius: 6px
            white-space:   nowrap
            font-weight:   600

        .star-count
            background-color: $yellow
            color:            $background-700

            :global
                .icon
                    height: 19px
                    fill:   $background-700
        
        .highlight-count
            background-color: $background-300
            color:            $yellow

            :global
                .icon
                    margin-right: -1px
                    height:       25px
                    fill:         $yellow
    
    .actions
        position:    absolute
        bottom:      0
        left:        100%
        margin-left: space.$default-padding
        width:       48px

        :global
            .action-button
                display:         flex
                align-items:     center
                justify-content: center
                margin-bottom:   16px
                width:           40px
                height:          40px
                box-sizing:      border-box
                border-radius:   8px
                border:          1px solid $background-300
                transition:      background-color easing.$quart-out 0.1s, border-color easing.$quart-out 0.1s
                cursor:          pointer

                &:last-of-type
                    margin-bottom: 0
                
                .icon
                    fill:       $background-200
                    transition: fill easing.$quart-out 0.1s
                    
                &.delete
                    .icon
                        height: 19px

                    &:hover
                        border-color:     $coral
                        background-color: $coral
                        transition:       none
                        
                        .icon
                            fill:       $background-700
                            transition: none

                    &:active
                        border-color:     color.adjust($coral, $lightness: -3%)
                        background-color: color.adjust($coral, $lightness: -3%)
                        transition:       none
                        
                        .icon
                            fill:       $background-700
                            transition: none
</style>
