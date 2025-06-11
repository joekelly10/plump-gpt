import { test, expect } from '@playwright/test'
import { fastExpect } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Providers', () => {
    test('we should be able to stream a response from Open AI', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'open-ai') {
            const model_list_button   = page.locator('.active-model-button'),
                  model_list          = page.locator('.models-by-family'),
                  openai_model        = models.find(m => m.type === 'open-ai'),
                  openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
                  active_model_icon   = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(openai_model_button).toBeVisible()

            await openai_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
        }

        await input.fill('Wake up, GPT')
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.content')).toHaveText('Wake up, GPT')

        await expect(ai_message, { timeout: 10000 }).toHaveCount(1)
        await fastExpect(ai_message.locator('.content')).toHaveText('What the hell?')
    })
})
