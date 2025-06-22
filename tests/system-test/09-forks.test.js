import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { switchModel } from '../helpers/actions'
import { short_reply_prompt, short_reply, medium_reply_prompt, medium_reply } from '../mock/prompts/messages'

import models from '../../src/lib/fixtures/models'
import defaults from '../../src/lib/fixtures/defaults'

test.describe('Forks', () => {
    test('we should be able to create many replies to one prompt', async ({ page }) => {
        await page.goto('/')

        const default_model    = models.find(m => m.id === defaults.model),
              input            = page.locator('.primary-input-section .input'),
              chat             = page.locator('.chat'),
              user_message     = chat.locator('.messages .message.user'),
              ai_message       = chat.locator('.messages .message.assistant'),
              add_reply_button = ai_message.locator('.message-controls-right .add'),
              hover_info       = ai_message.locator('.hover-info-add-reply'),
              forks_container  = page.locator('.prompt-forks-container'),
              fork_buttons     = forks_container.locator('.prompt-fork-button')

        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
        await expect(add_reply_button).toBeVisible()

        await sleep(500)

        const second_model = models.find(m => m.id !== defaults.model)
        await switchModel(page, second_model)

        await add_reply_button.hover()
        await expect(hover_info).toBeVisible()
        await expect(hover_info.locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(hover_info.locator('.text')).toContainText(`Add Another Reply`)
        await expect(hover_info.locator('.model-name')).toHaveText(second_model.name)

        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(add_reply_button).toBeVisible()

        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        const third_model = models.find(m => m.id !== defaults.model && m.id !== second_model.id)
        await switchModel(page, third_model)
        
        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(3)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)
        await expect(add_reply_button).toBeVisible()

        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)
    })

    test('we should be able to delete any one out of many replies', async ({ page }) => {
        await page.goto('/')

        const default_model     = models.find(m => m.id === defaults.model),
              input             = page.locator('.primary-input-section .input'),
              chat              = page.locator('.chat'),
              user_message      = chat.locator('.messages .message.user'),
              ai_message        = chat.locator('.messages .message.assistant'),
              add_reply_button  = ai_message.locator('.message-controls-right .add'),
              delete_button     = ai_message.locator('.message-controls-right .delete'),
              hover_info_add    = ai_message.locator('.hover-info-add-reply'),
              hover_info_delete = ai_message.locator('.hover-info-delete'),
              forks_container   = page.locator('.prompt-forks-container'),
              fork_buttons      = forks_container.locator('.prompt-fork-button')

        await input.fill(short_reply_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await sleep(500)

        const second_model = models.find(m => m.id !== defaults.model)
        await switchModel(page, second_model)

        await add_reply_button.hover()
        await expect(hover_info_add).toBeVisible()
        await expect(hover_info_add.locator('.model-icon')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
        await expect(hover_info_add.locator('.text')).toContainText(`Add Another Reply`)
        await expect(hover_info_add.locator('.model-name')).toHaveText(second_model.name)

        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        const third_model = models.find(m => m.id !== defaults.model && m.id !== second_model.id)
        await switchModel(page, third_model)
        
        await add_reply_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(3)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await fork_buttons.nth(0).click()
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(fork_buttons.nth(2)).not.toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${default_model.icon}`)

        await delete_button.hover()
        await expect(hover_info_delete).toBeVisible()
        await expect(hover_info_delete.locator('.text')).toContainText(`Delete`)

        page.on('dialog', async dialog => { await dialog.accept() })

        await delete_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).toBeVisible()
        await expect(fork_buttons).toHaveCount(2)
        await expect(fork_buttons.nth(0)).toContainClass('active')
        await expect(fork_buttons.nth(1)).not.toContainClass('active')
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)

        await fork_buttons.nth(1).click()
        await expect(fork_buttons.nth(0)).not.toContainClass('active')
        await expect(fork_buttons.nth(1)).toContainClass('active')
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${third_model.icon}`)

        await delete_button.click()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(short_reply_prompt)
        await expect(forks_container).not.toBeVisible()
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(short_reply)
        await expect(ai_message.locator('.avatar')).toHaveAttribute('src', `/img/icons/models/${second_model.icon}`)
    })
})
