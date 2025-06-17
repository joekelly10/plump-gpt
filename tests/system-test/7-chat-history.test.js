import { test, expect } from '@playwright/test'
import { fastExpect, sleep } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { persistence_prompt, persistence_reply } from '../mock/prompts/persistence'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Chat History', () => {
    test('we should be able to re-load a chat', async ({ page }) => {
        await page.goto('/')

        expect(defaults.autosave).toBe(true)

        const input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        await input.fill(persistence_prompt)
        await page.keyboard.press('Enter')
        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(persistence_prompt)
        await fastExpect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(persistence_reply)

        await sleep(250) // allow chat to be saved to db
        await page.reload()

        const load_button = page.locator('.load-button'),
              loader      = page.locator('.loader'),
              chat_list   = loader.locator('.chats'),
              latest_chat = chat_list.locator('.loader-chat').first()

        await load_button.click()
        await fastExpect(loader).toBeVisible()

        await latest_chat.click()
        await fastExpect(loader).toBeHidden()
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(persistence_prompt)
        await fastExpect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(persistence_reply)
    })
})
