<script>
    import { chat_id, messages, forks, active_fork, stars, highlights } from '$lib/stores/chat'

    export const saveChat = () => save()

    let timer

    let status = $state('idle'),
        queued = $state(false)

    const save = async () => {
        if ($messages.length === 1) return

        // queue up save if another save is already in flight
        if (status === 'saving') {
            console.log('💾–⏳ Save queued (debounce)')
            queued = true
            return
        }

        clearTimeout(timer)

        console.log('💾 Saving chat...')
        status = 'saving'
        
        const response = await fetch('/api/chats/save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                id:          $chat_id,
                messages:    $messages,
                forks:       $forks,
                active_fork: $active_fork,
                stars:       $stars,
                highlights:  $highlights
            })
        })

        if (response.ok) {
            const { saved_chat } = await response.json()
            $chat_id = saved_chat.id
            console.log(`💾–✅ Saved chat: ${saved_chat.id}`)
            timer = setTimeout(() => {
                status = 'saved'
                if (queued) {
                    queued = false
                    console.log('💾–⚙️ Unqueuing save')
                    saveChat()
                    return
                }
                timer = setTimeout(() => {
                    status = 'idle'
                }, 2000)
            }, 500)
        } else {
            status = 'idle'
            console.log(`💾–❌ Save failed: ${response.status} ${response.statusText}`)
            const json = await response.json()
            if (json) console.log(json)
        }
    }

    const keydown = (e) => {
        if ((e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's')) {
            e.preventDefault()
            saveChat()
        }
    }
</script>

<svelte:document on:keydown={keydown} />

<button class='save-button {status}' title='Save chat (⌘+S)' onclick={saveChat}>
    <span class='save-text'>
        Save
    </span>
    <div class='spinner'>
        <img class='spinner-img' src='/img/icons/cog.png' alt='Saving'>
    </div>
    <span class='saved-text'>
        Saved
    </span>
</button>

<style lang='sass'>
    .save-button
        display:         flex
        flex-wrap:       nowrap
        justify-content: center
        align-items:     center
        position:        relative
        width:           space.$load-save-button-width
        height:          space.$header-height
        font-size:       14px
        font-weight:     450
        color:           $background-200
        cursor:          pointer
        transition:      background-color easing.$quart-out 0.1s, color easing.$quart-out 0.1s
        
        &:hover
            background-color: $background-800
            transition:       none

            .save-text
                font-weight: 600
                color:       $off-white
        
        &:active
            background-color: color.adjust($background-800, $lightness: -1%)
            transition:       none

        &.saving
            .save-text
                opacity:    0
                transition: none

            .spinner
                opacity: 1

                .spinner-img
                    animation: animation.$spinner-animation

        &.saved
            .save-text
                opacity:    0
                transition: none
            
            .saved-text
                opacity: 1

    .save-text
        opacity:    1
        transition: opacity easing.$quart-out 0.125s 0.125s

    .spinner
        position:  absolute
        top:       50%
        left:      50%
        transform: translateX(-50%) translateY(-9px)
        opacity:   0

        .spinner-img
            height: 19px
    
    .saved-text
        position:    absolute
        top:         50%
        left:        50%
        transform:   translateX(-50%) translateY(-50%)
        color:       $blue-grey
        font-weight: 600
        opacity:     0
        transition:  opacity easing.$quart-out 0.125s
</style>
