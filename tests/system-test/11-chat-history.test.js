import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { persistence_prompt, persistence_reply } from '../mock/prompts/persistence'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Chat History', () => {
    test('we should be able to re-load a chat', async ({ page }) => {
        await page.goto('/')

        expect(defaults.autosave).toBe(true)

        const input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant'),
              save_button   = page.locator('.save-button')
        
        await input.fill(persistence_prompt)
        await page.keyboard.press('Enter')
        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(persistence_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(persistence_reply)

        await expect(save_button).toContainClass('saved')

        await page.reload()

        const load_button = page.locator('.load-button'),
              loader      = page.locator('.loader'),
              chat_list   = loader.locator('.chats'),
              latest_chat = chat_list.locator('.loader-chat').first()

        await load_button.click()
        await expect(loader).toBeVisible()

        await latest_chat.click()
        await expect(loader).toBeHidden()
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(persistence_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(persistence_reply)
    })
})
