<script>
    import { onMount, onDestroy } from 'svelte'
    import { fade } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { shortcuts_active } from '$lib/stores/chat'

    const keydown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            $shortcuts_active = false
        }
    }

    onMount(() => {
        document.addEventListener('keydown', keydown)
    })

    onDestroy(() => {
        document.removeEventListener('keydown', keydown)
    })
</script>

<div class='shortcuts' transition:fade={{ duration: 100, easing: quartOut }}>
    <div class='shortcut-table'>
        <div class='title'>
            Chat
        </div>

        <div class='key'>⌃ O</div>
        <span class='command'>Open <span class='load-chat'>(Load)</span></span>
        <div class='key'>⌃ S</div>
        <span class='command'>Save</span>
        <div class='key'>⌃ N</div>
        <span class='command'>New</span>

        <div class='space'/>

        <div class='key'>⌘ ⌫</div>
        <span class='command'>Delete One</span>
        <div class='key'>⌘ ⌥ ⌫</div>
        <span class='command'>Delete All</span>

        <div class='space'/>

        <div class='key'>⌘ M</div>
        <span class='command'>Next Model</span>
        <div class='key'>⌘ ⇧ M</div>
        <span class='command'>Prev Model</span>

        <div class='space'/>

        <div class='key'>⌥ ⬆ ⬇</div>
        <span class='command'>Scroll Up / Down</span>
        <div class='key'>⇧ ⌥ ⬆ ⬇</div>
        <span class='command'>...to Top / Bottom</span>

        <div class='title'>
            Loader
        </div>

        <div class='key'>⬅ ⬆ ⬇ ➡</div>
        <span class='command'>Select <span class='load-chat'>(Load Chat)</span></span>
        <div class='key'>ENTER</div>
        <span class='command'>Load <span class='load-chat'>(Load Chat)</span></span>
        <div class='key'>⌘ ⌫</div>
        <span class='command'>Delete <span class='load-chat'>(Load Chat)</span></span>
    </div>
</div>

<style lang='sass'>
    .shortcuts
        position:         absolute
        top:              0 - space.$default-padding
        left:             16px + space.$default-padding
        transform:        translateY(-100%)
        padding:          0 space.$default-padding space.$default-padding
        border-radius:    8px
        background-color: $background-darker
        line-height:      2
        font-size:        14px
    
    .shortcut-table
        display: grid
    
    .title
        grid-column:    span 2
        padding-top:    space.$default-padding
        padding-bottom: space.$default-padding
        text-align:     center
        font-weight:    600
        color:          $blue-grey
    
    .key
        grid-column:  1
        margin-right: space.$default-padding
        text-align:   center
        font-weight:  600
        color:        $blue

    .command
        grid-column: 2
    
    .space
        grid-column: span 2
        height:      21px
    
    .load-chat
        margin-left: 3px
        color:       $blue-grey
</style>
