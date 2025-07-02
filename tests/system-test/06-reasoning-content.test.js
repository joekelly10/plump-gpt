import { test, expect } from '@playwright/test'
import { switchModel } from '../helpers/actions'
import { basic_reasoning_prompt, basic_reasoning_content, basic_reasoning_reply } from '../mock/prompts/basic_reasoning'

import defaults from '../../src/lib/fixtures/defaults'
import models from '../../src/lib/fixtures/models'

test.describe('Reasoning Content', () => {
    test('we should see the reasoning from Anthropic models', async ({ page }) => {
        await page.goto('/')

        const default_model          = models.find(m => m.id === defaults.model),
              input                  = page.locator('.primary-input-section .input'),
              user_message           = page.locator('.chat .messages .message.user'),
              ai_message             = page.locator('.chat .messages .message.assistant'),
              thinking_budget_button = page.locator('.thinking-budget-button')

        if (default_model.type !== 'anthropic' || !default_model.is_reasoner) {
            const anthropic_model = models.find(m => m.type === 'anthropic' && m.is_reasoner)
            await switchModel(page, anthropic_model)
        }

        await thinking_budget_button.click()
        await expect(thinking_budget_button).toContainText('1,000')

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)
        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from Google models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')

        if (default_model.type !== 'google' || !default_model.is_reasoner) {
            const google_model = models.find(m => m.type === 'google' && m.is_reasoner)
            await switchModel(page, google_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from X models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'x' || !default_model.is_reasoner) {
            const x_model = models.find(m => m.type === 'x' && m.is_reasoner)
            await switchModel(page, x_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from DeepSeek models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'deepseek' || !default_model.is_reasoner) {
            const deepseek_model = models.find(m => m.type === 'deepseek' && m.is_reasoner)
            await switchModel(page, deepseek_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from OpenRouter models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'openrouter' || !default_model.is_reasoner) {
            const openrouter_model = models.find(m => m.type === 'openrouter' && m.is_reasoner)
            await switchModel(page, openrouter_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })

    test('we should see the reasoning from Groq models', async ({ page }) => {
        await page.goto('/')

        const default_model = models.find(m => m.id === defaults.model),
              input         = page.locator('.primary-input-section .input'),
              user_message  = page.locator('.chat .messages .message.user'),
              ai_message    = page.locator('.chat .messages .message.assistant')
        
        if (default_model.type !== 'groq' || !default_model.is_reasoner) {
            const groq_model = models.find(m => m.type === 'groq' && m.is_reasoner)
            await switchModel(page, groq_model)
        }

        await input.fill(basic_reasoning_prompt)
        await page.keyboard.press('Enter')

        await expect(input).toHaveText('')
        await expect(user_message).toHaveCount(1)
        await expect(user_message.locator('.message-content')).toHaveText(basic_reasoning_prompt)

        await expect(ai_message).toHaveCount(1)
        await expect(ai_message.locator('.reasoning-content')).toContainText(basic_reasoning_content)
        await expect(ai_message.locator('.message-content')).toHaveText(basic_reasoning_reply)
    })
})
