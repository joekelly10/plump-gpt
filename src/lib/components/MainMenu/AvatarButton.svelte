<script>
    import { avatar_href } from '$lib/stores/user'

    let is_uploading = $state(false),
        error        = $state(null)

    const upload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        console.log('👤 Uploading avatar...')

        error        = null
        is_uploading = true
        
        try {
            const data = new FormData()
            data.append('avatar', file)
            
            const response = await fetch('/api/avatar', {
                method: 'POST',
                body:   data
            })
            
            if (response.ok) {
                console.log('👤–✅ Avatar uploaded.')
                const result = await response.json()
                $avatar_href = result.href
            } else {
                console.log('👤–❌ Avatar upload failed.')
                error = 'Avatar upload failed'
            }
        } catch (err) {
            console.log('👤–❌ Avatar upload error:', err)
            error = err.message || 'An unexpected error occurred'
        } finally {
            is_uploading = false
        }
    }
</script>

<button class='main-menu-button avatar-button'>
    <div class='title'>
        Your Avatar
        {#if error}
            <div class='error-message'>
                {error}
            </div>
        {/if}
    </div>
    <label for='avatar-file-input' class='avatar-input-wrapper'>
        <div class='choose-file-label'>
            Choose file...
        </div>
        <div class='avatar-container'>
            <img class='avatar-img' alt='Avatar' src={$avatar_href} />
            <div class='icon-layer'>
                <img class='edit-icon' alt='Edit' src='/img/icons/edit-white.png' />
            </div>
        </div>
        <input 
            id='avatar-file-input'
            class='file-input'
            type='file' 
            accept='image/*'
            onchange={upload}
            disabled={is_uploading}
        />
    </label>
</button>

<style lang='sass'>
    .title
        .error-message
            color: $coral

    .avatar-input-wrapper
        display:         flex
        align-items:     center
        justify-content: flex-end
        gap:             space.$default-padding
        position:        absolute
        top:             0
        left:            0
        width:           100%
        height:          100%
        box-sizing:      border-box
        padding:         0 space.$default-padding
        cursor:          pointer

        &:hover
            .choose-file-label
                left:    0
                opacity: 1

            .avatar-container
                .icon-layer
                    opacity:    1
                    transition: none

        &:active
            .choose-file-label
                opacity: 1

            .avatar-container
                .icon-layer
                    background-color: color.adjust($background-500, $alpha: -0.225)
                    transition:       none

        .file-input
            display: none

        .choose-file-label
            position:    relative
            left:        4px
            font-size:   14px
            font-weight: 400
            color:       $off-white
            opacity:     0
            transition:  opacity easing.$quart-out 125ms, left easing.$quart-out 125ms
    
        .avatar-container
            position:      relative
            width:         36px
            height:        36px
            border-radius: 6px
            overflow:      hidden
            
            .avatar-img
                position:      relative
                z-index:       1
                width:         100%
                height:        100%
                object-fit:    cover
            
            .icon-layer
                display:          flex
                align-items:      center
                justify-content:  center
                position:         absolute
                top:              0
                left:             0
                z-index:          2
                width:            100%
                height:           100%
                background-color: color.adjust($background-500, $alpha: -0.25)
                opacity:          0
                transition:       opacity easing.$quart-out 125ms

                .edit-icon
                    height: 16px
</style>
