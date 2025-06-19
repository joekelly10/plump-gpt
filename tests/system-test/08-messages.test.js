import { test, expect } from '@playwright/test'
import { fastExpect, slowExpect, sleep } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { delay_prompt, delay_reply } from '../mock/prompts/messages'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Messages', () => {
    test('we should see a waiting message while waiting for the API connection to be established', async ({ page }) => {
        await page.goto('/')

        const input               = page.locator('.primary-input-section .input'),
              model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              openai_model        = models.find(m => m.type === 'open-ai'),
              openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              chat                = page.locator('.chat'),
              user_message        = chat.locator('.messages .message.user'),
              connecting_div      = chat.locator('.connecting')

        await model_list_button.click()
        await fastExpect(model_list).toBeVisible()
        await fastExpect(openai_model_button).toBeVisible()

        await openai_model_button.click()
        await fastExpect(model_list).toBeHidden()
        await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
    
        await input.fill(delay_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(delay_prompt)

        await sleep(2000)

        await fastExpect(connecting_div).toBeVisible()
        await fastExpect(connecting_div.locator('.text')).toContainText(`Waiting for ${openai_model.hosted_at}`)
    })

    test('we should see a waiting message while waiting for the reply to start streaming', async ({ page }) => {
        await page.goto('/')

        const input               = page.locator('.primary-input-section .input'),
              model_list_button   = page.locator('.active-model-button'),
              model_list          = page.locator('.models-by-family'),
              openai_model        = models.find(m => m.type === 'open-ai'),
              openai_model_button = model_list.locator(`#model-button-${cssSanitised(openai_model.id)}`),
              active_model_icon   = model_list_button.locator('.icon'),
              chat                = page.locator('.chat'),
              user_message        = chat.locator('.messages .message.user'),
              ai_message          = chat.locator('.messages .message.assistant')

        await model_list_button.click()
        await fastExpect(model_list).toBeVisible()
        await fastExpect(openai_model_button).toBeVisible()

        await openai_model_button.click()
        await fastExpect(model_list).toBeHidden()
        await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openai_model.icon}`)
    
        await input.fill(delay_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(delay_prompt)
        await fastExpect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.status-text')).toContainText(`Waiting for ${openai_model.short_name}`)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(delay_reply)
    })
})
