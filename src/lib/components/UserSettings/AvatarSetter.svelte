<script>
    import { slide } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { avatar_href } from '$lib/stores/user'

    let is_uploading = false,
        error        = null

    const upload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        console.log('👤 Uploading avatar...')

        is_uploading = true
        error        = null
        
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

<div class='avatar-setter'>
    <div class='setting-title'>
        Avatar
    </div>
    <div class='input-container'>
        <label for='avatar-file-input' class='input-label'>
            <div class='avatar-container'>
                <img class='avatar' alt='Avatar' src={$avatar_href} />
                <div class='icon-layer'>
                    <img class='edit-icon' alt='Edit' src='/img/icons/edit-white.png' />
                </div>
            </div>
            <div class='choose-file-button'>
                Choose file...
            </div>
            <input 
                id='avatar-file-input'
                class='file-input'
                type='file' 
                accept='image/*'
                on:change={upload}
                disabled={is_uploading}
            />
        </label>
    </div>
    
    {#if error}
        <div class='error-message' in:slide={{ axis: 'y', duration: 125, easing: quartOut }}>
            ⚠️ &nbsp; {error}
        </div>
    {/if}
</div>

<style lang='sass'>
    .avatar-setter
        position: relative
    
    .input-container
        .input-label
            display:         inline-flex
            align-items:     center
            justify-content: flex-start
            gap:             space.$default-padding
            position:        relative
            cursor:          pointer

            &:hover,
            &:active
                .avatar-container
                    .icon-layer
                        opacity:    1
                        transition: none
            
            &:active
                .avatar-container
                    .icon-layer
                        background-color: color.adjust($background, $alpha: -0.225)
            
            .avatar-container
                position:      relative
                width:         64px
                height:        64px
                border-radius: 16px
                overflow:      hidden
        
            .avatar
                width:      100%
                height:     100%
                object-fit: cover
            
            .icon-layer
                display:          flex
                align-items:      center
                justify-content:  center
                position:         absolute
                top:              0
                left:             0
                width:            100%
                height:           100%
                background-color: color.adjust($background, $alpha: -0.25)
                opacity:          0
                transition:       opacity easing.$quart-out 100ms

                .edit-icon
                    height: 19px

            .choose-file-button
                display:          flex
                align-items:      center
                justify-content:  center
                height:           40px
                padding:          0 space.$default-padding
                border-radius:    8px
                background-color: $off-white
                font-size:        14px
                font-weight:      600
                color:            $background-darker

                &:hover,
                &:active
                    background-color: color.mix($background, $off-white, 5%)
                    color:            $background-darkest
                
                &:active
                    background-color: color.mix($background, $off-white, 7.5%)

            .file-input
                display: none

    .error-message
        margin-top:  20px
        font-size:   14px
        font-weight: 500
        line-height: font.$line-height-14px
        color:       $coral
</style>
