import { test, expect } from '@playwright/test'
import { sleep } from '../helpers/tools'
import { send_immediately_prompt, send_immediately_reply } from '../mock/prompts/send_immediately'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Launch', () => {
    test('we should see feedback while the app is initialising', async ({ page }) => {
        await page.goto('/')

        const initialiser = page.locator('.initialiser')
        await expect(initialiser).toBeVisible()
    })

    test('URL parameter "model=[model_id]" should set the model', async ({ page }) => {
        const non_default_model = models.find(m => m.id !== defaults.model),
              model_list_button = page.locator('.active-model-button'),
              active_model_icon = model_list_button.locator('.icon')

        await page.goto(`/?model=${non_default_model.id}`)
        await expect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${non_default_model.icon}`)
    })

    test('URL parameter "user_message=[...]" should set the message as input text', async ({ page }) => {
        const user_message = "boobies are birds."
        await page.goto(`/?user_message=${user_message}`)

        const input = page.locator('.primary-input-section .input')
        await expect(input).toHaveText(user_message)
        await sleep(100)
        expect(page.url()).not.toContain('user_message')
    })

    test('URL parameter "send_immediately=true" should send the message immediately', async ({ page }) => {
        await page.goto(`/?user_message=${send_immediately_prompt}&send_immediately=true`)

        const input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(send_immediately_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.message-content')).toHaveText(send_immediately_reply)
        await expect(input).toHaveText('')
    })
})
