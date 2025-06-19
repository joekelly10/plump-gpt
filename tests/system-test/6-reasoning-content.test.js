import { test, expect } from '@playwright/test'
import { fastExpect } from '../helpers/tools'
import { cssSanitised } from '../../src/lib/utils/helpers'
import { basic_reasoning_prompt, basic_reasoning, basic_reasoning_reply } from '../mock/prompts/basic_reasoning'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Reasoning Content', () => {
    test('we should see the reasoning from Google models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'google' || !default_model.is_reasoner) {
            const model_list_button   = page.locator('.active-model-button'),
                  model_list          = page.locator('.models-by-family'),
                  google_model        = models.find(m => m.type === 'google' && m.is_reasoner),
                  google_model_button = model_list.locator(`#model-button-${cssSanitised(google_model.id)}`),
                  active_model_icon   = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(google_model_button).toBeVisible()

            await google_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${google_model.icon}`)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from X models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'x' || !default_model.is_reasoner) {
            const model_list_button = page.locator('.active-model-button'),
                  model_list        = page.locator('.models-by-family'),
                  x_model           = models.find(m => m.type === 'x' && m.is_reasoner),
                  x_model_button    = model_list.locator(`#model-button-${cssSanitised(x_model.id)}`),
                  active_model_icon = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(x_model_button).toBeVisible()

            await x_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${x_model.icon}`)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from DeepSeek models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'deepseek' || !default_model.is_reasoner) {
            const model_list_button     = page.locator('.active-model-button'),
                  model_list            = page.locator('.models-by-family'),
                  deepseek_model        = models.find(m => m.type === 'deepseek' && m.is_reasoner),
                  deepseek_model_button = model_list.locator(`#model-button-${cssSanitised(deepseek_model.id)}`),
                  active_model_icon     = model_list_button.locator('.icon')

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(deepseek_model_button).toBeVisible()

            await deepseek_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${deepseek_model.icon}`)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from OpenRouter models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'openrouter' || !default_model.is_reasoner) {
            const model_list_button       = page.locator('.active-model-button'),
                  model_list              = page.locator('.models-by-family'),
                  openrouter_model        = models.find(m => m.type === 'openrouter' && m.is_reasoner),
                  openrouter_model_button = model_list.locator(`#model-button-${cssSanitised(openrouter_model.id)}`),
                  active_model_icon       = model_list_button.locator('.icon')
            
            if (!openrouter_model) test.skip()

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(openrouter_model_button).toBeVisible()

            await openrouter_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${openrouter_model.icon}`)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from Groq models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'groq' || !default_model.is_reasoner) {
            const model_list_button = page.locator('.active-model-button'),
                  model_list        = page.locator('.models-by-family'),
                  groq_model        = models.find(m => m.type === 'groq' && m.is_reasoner),
                  groq_model_button = model_list.locator(`#model-button-${cssSanitised(groq_model.id)}`),
                  active_model_icon = model_list_button.locator('.icon')
            
            if (!groq_model) test.skip()

            await model_list_button.click()
            await fastExpect(model_list).toBeVisible()
            await fastExpect(groq_model_button).toBeVisible()

            await groq_model_button.click()
            await fastExpect(model_list).toBeHidden()
            await fastExpect(active_model_icon).toHaveAttribute('src', `/img/icons/models/${groq_model.icon}`)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await fastExpect(input).toHaveText('')
        await fastExpect(user_message).toHaveCount(1)
        await fastExpect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await fastExpect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning)
        await fastExpect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })
})
